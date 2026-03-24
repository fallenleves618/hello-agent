import { GovernorAgent } from "../agents/governor.js";
import { HypothesisAgent } from "../agents/hypothesis.js";
import { PlannerAgent } from "../agents/planner.js";
import { ProfilerAgent } from "../agents/profiler.js";
import { ReactorAgent } from "../agents/reactor.js";
import { FixerAgent } from "../agents/fixer.js";
import { VerifierAgent } from "../agents/verifier.js";
import { Logger } from "../observability/logger.js";
import { MemoryStore } from "../memory/store.js";
import {
  parseWithSchema,
  ReactStep,
  RunContextSchema,
  WorkflowResult,
  WorkflowResultSchema,
} from "../types/contracts.js";

interface Agents {
  planner: PlannerAgent;
  profiler: ProfilerAgent;
  hypothesis: HypothesisAgent;
  fixer: FixerAgent;
  verifier: VerifierAgent;
  governor: GovernorAgent;
  reactor: ReactorAgent;
}

export class InpAutofixWorkflow {
  constructor(
    private readonly agents: Agents,
    private readonly memory: MemoryStore,
    private readonly logger: Logger,
    private readonly reactOptions: { enabled: boolean; maxSteps: number },
  ) {}

  async run(page: string): Promise<WorkflowResult> {
    const runContext = parseWithSchema(RunContextSchema, {
      runId: `run-${Date.now()}`,
      startedAt: new Date().toISOString(),
      page,
    }, "workflow.runContext");
    this.logger.info("Run context initialized", runContext);

    const tasks = this.agents.planner.createPlan(page);
    this.logger.info("Planner produced task graph", tasks);

    const reactTrace: ReactStep[] = [];

    const signal = await this.runReactStep(
      "profile",
      reactTrace,
      (_attempt) => this.agents.profiler.analyze(page),
      (result, attempt) => `Collected INP=${result.inpMs}ms (attempt=${attempt})`,
    );
    this.logger.info("Profiler collected signal", signal);

    const hypothesis = this.agents.hypothesis.generate(signal);
    this.logger.info("Hypothesis generated", hypothesis);

    const patch = await this.runReactStep(
      "fix",
      reactTrace,
      (_attempt) => this.agents.fixer.propose(hypothesis),
      (result, attempt) => `Generated patch risk=${result.risk} (attempt=${attempt})`,
    );
    this.logger.info("Fix proposal generated", patch);

    const verification = await this.runReactStep(
      "verify",
      reactTrace,
      (_attempt) => this.agents.verifier.verify(page, signal),
      (result, attempt) => `Verification passed=${result.passed} (attempt=${attempt})`,
    );
    this.logger.info("Verification result", verification);

    const governance = this.agents.governor.decide(patch, verification);
    this.logger.info("Governor decision", governance);
    this.logger.info("ReAct trace summary", reactTrace);

    this.memory.add({
      runId: runContext.runId,
      page: signal.page,
      interaction: signal.interaction,
      hypothesis,
      patch,
      verification,
      createdAt: new Date().toISOString(),
    });

    return parseWithSchema(WorkflowResultSchema, {
      signal,
      hypothesis,
      patch,
      verification,
      governance,
      reactTrace,
    }, "workflow.result");
  }

  private async runReactStep<T>(
    phase: "profile" | "fix" | "verify",
    traceSink: ReactStep[],
    action: (attempt: number) => Promise<T>,
    summarize: (result: T, attempt: number) => string,
  ): Promise<T> {
    const reactResult = await this.agents.reactor.run({
      phase,
      enabled: this.reactOptions.enabled,
      maxSteps: this.reactOptions.maxSteps,
      action,
      // Keep observation compact so a full run remains readable in logs.
      summarize,
    });
    traceSink.push(...reactResult.trace);
    return reactResult.result;
  }
}
