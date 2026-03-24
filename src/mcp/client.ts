import { PerformanceSignal } from "../types/contracts.js";

export interface MpcClient {
  collectInpSignal(page: string): Promise<unknown>;
  createPatchFromFix(targetFiles: string[], fix: string): Promise<unknown>;
  runVerification(page: string): Promise<unknown>;
}

export class MockMcpClient implements MpcClient {
  private readonly invalidMode = (process.env.MOCK_INVALID_TOOL_OUTPUT ?? "false").toLowerCase() === "true";

  async collectInpSignal(page: string): Promise<PerformanceSignal> {
    if (this.invalidMode) {
      return {
        page,
        interaction: "checkout-button-click",
        // Simulate broken tool output for schema rejection testing.
        inpMs: "420" as unknown as number,
        p75InpMs: 390,
        longTaskMs: 280,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      page,
      interaction: "checkout-button-click",
      inpMs: 420,
      p75InpMs: 390,
      longTaskMs: 280,
      timestamp: new Date().toISOString(),
    };
  }

  async createPatchFromFix(targetFiles: string[], fix: string): Promise<string> {
    return `Patch for ${targetFiles.join(", ")}: ${fix}`;
  }

  async runVerification(_page: string): Promise<{ inpAfter: number; passed: boolean }> {
    return {
      inpAfter: 190,
      passed: true,
    };
  }
}
