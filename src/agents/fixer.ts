import { MpcClient } from "../mcp/client.js";
import {
  Hypothesis,
  parseWithSchema,
  PatchDiffSummarySchema,
  PatchProposal,
  PatchProposalSchema,
} from "../types/contracts.js";

export class FixerAgent {
  constructor(private readonly mcp: MpcClient) {}

  async propose(hypothesis: Hypothesis): Promise<PatchProposal> {
    const targetFiles = ["src/pages/checkout.tsx", "src/hooks/useCheckout.ts"];
    const rawDiffSummary = await this.mcp.createPatchFromFix(targetFiles, hypothesis.suggestedFix);
    const diffSummary = parseWithSchema(PatchDiffSummarySchema, rawDiffSummary, "tool.createPatchFromFix");

    return parseWithSchema(PatchProposalSchema, {
      targetFiles,
      diffSummary,
      risk: "medium",
    }, "agent.fixer.output");
  }
}
