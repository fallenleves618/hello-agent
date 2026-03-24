import { MpcClient } from "../mcp/client.js";
import {
  parseWithSchema,
  PerformanceSignal,
  VerificationResult,
  VerificationResultSchema,
  VerificationToolResultSchema,
} from "../types/contracts.js";

export class VerifierAgent {
  constructor(private readonly mcp: MpcClient) {}

  async verify(page: string, signal: PerformanceSignal): Promise<VerificationResult> {
    const rawResult = await this.mcp.runVerification(page);
    const result = parseWithSchema(VerificationToolResultSchema, rawResult, "tool.runVerification");
    return parseWithSchema(VerificationResultSchema, {
      passed: result.passed,
      inpBefore: signal.inpMs,
      inpAfter: result.inpAfter,
      notes: result.passed ? "INP improved and no blocking regressions found" : "INP target not met",
    }, "agent.verifier.output");
  }
}
