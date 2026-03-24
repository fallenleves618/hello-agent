import { MpcClient } from "../mcp/client.js";
import { parseWithSchema, PerformanceSignal, PerformanceSignalSchema } from "../types/contracts.js";

export class ProfilerAgent {
  constructor(private readonly mcp: MpcClient) {}

  async analyze(page: string): Promise<PerformanceSignal> {
    const rawSignal = await this.mcp.collectInpSignal(page);
    return parseWithSchema(PerformanceSignalSchema, rawSignal, "tool.collectInpSignal");
  }
}
