import { Hypothesis, PatchProposal, VerificationResult } from "../types/contracts.js";

export interface MemoryRecord {
  runId: string;
  page: string;
  interaction: string;
  hypothesis: Hypothesis;
  patch: PatchProposal;
  verification: VerificationResult;
  createdAt: string;
}

export class MemoryStore {
  private readonly records: MemoryRecord[] = [];

  add(record: MemoryRecord): void {
    this.records.push(record);
  }

  findByPage(page: string): MemoryRecord[] {
    return this.records.filter((item) => item.page === page);
  }

  summary(): { total: number; passed: number } {
    const passed = this.records.filter((r) => r.verification.passed).length;
    return { total: this.records.length, passed };
  }
}
