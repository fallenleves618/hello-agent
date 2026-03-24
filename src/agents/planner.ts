import { parseWithSchema, PlanTask, PlanTaskListSchema } from "../types/contracts.js";

export class PlannerAgent {
  createPlan(page: string): PlanTask[] {
    return parseWithSchema(PlanTaskListSchema, [
      { id: "collect-signal", title: `Collect INP data for ${page}`, priority: "P0" },
      { id: "generate-hypothesis", title: "Generate top root-cause hypothesis", priority: "P0" },
      { id: "propose-fix", title: "Create minimal patch proposal", priority: "P1" },
      { id: "verify", title: "Run automated verification", priority: "P0" },
    ], "agent.planner.output");
  }
}
