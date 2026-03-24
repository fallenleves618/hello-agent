import { PerformanceSignal } from "../types/contracts.js";

export interface MpcClient {
  collectInpSignal(page: string): Promise<unknown>;
  createPatchFromFix(targetFiles: string[], fix: string): Promise<unknown>;
  runVerification(page: string): Promise<unknown>;
}

export class MockMcpClient implements MpcClient {
  private readonly invalidMode = (process.env.MOCK_INVALID_TOOL_OUTPUT ?? "false").toLowerCase();
  private signalCallCount = 0;

  async collectInpSignal(page: string): Promise<PerformanceSignal> {
    this.signalCallCount += 1;
    const shouldReturnInvalid =
      this.invalidMode === "true" || this.invalidMode === "always" ||
      (this.invalidMode === "once" && this.signalCallCount === 1);

    if (shouldReturnInvalid) {
      return {
        page,
        interaction: "checkout-button-click",
        // Simulate a broken tool response to validate ReAct retries + schema rejection.
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
