import {
  GovernanceDecision,
  GovernanceDecisionSchema,
  parseWithSchema,
  PatchProposal,
  VerificationResult,
} from "../types/contracts.js";

export class GovernorAgent {
  decide(patch: PatchProposal, verification: VerificationResult): GovernanceDecision {
    if (!verification.passed) {
      return parseWithSchema(GovernanceDecisionSchema, {
        allowed: false,
        reason: "Verification failed",
        requiresHumanReview: true,
      }, "agent.governor.output");
    }

    if (patch.risk === "high") {
      return parseWithSchema(GovernanceDecisionSchema, {
        allowed: true,
        reason: "Allowed with manual approval because risk is high",
        requiresHumanReview: true,
      }, "agent.governor.output");
    }

    return parseWithSchema(GovernanceDecisionSchema, {
      allowed: true,
      reason: "Auto-merge eligible",
      requiresHumanReview: false,
    }, "agent.governor.output");
  }
}
