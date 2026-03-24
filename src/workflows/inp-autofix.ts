import { GovernorAgent } from "../agents/governor.js";
import { HypothesisAgent } from "../agents/hypothesis.js";
import { PlannerAgent } from "../agents/planner.js";
import { ProfilerAgent } from "../agents/profiler.js";
import { FixerAgent } from "../agents/fixer.js";
import { VerifierAgent } from "../agents/verifier.js";
import { Logger } from "../observability/logger.js";
import { MemoryStore } from "../memory/store.js";
import { parseWithSchema, RunContextSchema, WorkflowResult, WorkflowResultSchema } from "../types/contracts.js";

interface Agents {
  planner: PlannerAgent;
  profiler: ProfilerAgent;
  hypothesis: HypothesisAgent;
  fixer: FixerAgent;
  verifier: VerifierAgent;
  governor: GovernorAgent;
}

export class InpAutofixWorkflow {
  constructor(
    private readonly agents: Agents,
    private readonly memory: MemoryStore,
    private readonly logger: Logger,
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

    const signal = await this.agents.profiler.analyze(page);
    this.logger.info("Profiler collected signal", signal);

    const hypothesis = this.agents.hypothesis.generate(signal);
    this.logger.info("Hypothesis generated", hypothesis);

    const patch = await this.agents.fixer.propose(hypothesis);
    this.logger.info("Fix proposal generated", patch);

    const verification = await this.agents.verifier.verify(page, signal);
    this.logger.info("Verification result", verification);

    const governance = this.agents.governor.decide(patch, verification);
    this.logger.info("Governor decision", governance);

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
    }, "workflow.result");
  }
}
