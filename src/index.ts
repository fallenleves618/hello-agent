import { PlannerAgent } from "./agents/planner.js";
import { ProfilerAgent } from "./agents/profiler.js";
import { ReactorAgent } from "./agents/reactor.js";
import { HypothesisAgent } from "./agents/hypothesis.js";
import { FixerAgent } from "./agents/fixer.js";
import { VerifierAgent } from "./agents/verifier.js";
import { GovernorAgent } from "./agents/governor.js";
import { loadConfig } from "./config.js";
import { MemoryStore } from "./memory/store.js";
import { MockMcpClient } from "./mcp/client.js";
import { Logger } from "./observability/logger.js";
import { InpAutofixWorkflow } from "./workflows/inp-autofix.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = new Logger(config.logLevel);

  if (!config.mockMode) {
    logger.warn("Only mock mode is implemented in this initial version");
  }

  const mcp = new MockMcpClient();
  const memory = new MemoryStore();
  const reactor = new ReactorAgent();

  const workflow = new InpAutofixWorkflow(
    {
      planner: new PlannerAgent(),
      profiler: new ProfilerAgent(mcp),
      hypothesis: new HypothesisAgent(),
      fixer: new FixerAgent(mcp),
      verifier: new VerifierAgent(mcp),
      governor: new GovernorAgent(),
      reactor,
    },
    memory,
    logger,
    {
      enabled: config.enableReact,
      maxSteps: config.reactMaxSteps,
    },
  );

  const page = process.argv[2] ?? "/checkout";
  const result = await workflow.run(page);

  logger.info("Workflow completed", result);
  logger.info("Memory summary", memory.summary());
}

main().catch((error: unknown) => {
  console.error("Fatal error", error);
  process.exit(1);
});
