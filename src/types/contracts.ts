import { z } from "zod";

export const SeveritySchema = z.enum(["low", "medium", "high"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const RunContextSchema = z.object({
  runId: z.string().min(1),
  startedAt: z.string().datetime(),
  page: z.string().min(1),
});
export type RunContext = z.infer<typeof RunContextSchema>;

export const PlanTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  priority: z.enum(["P0", "P1", "P2"]),
});
export const PlanTaskListSchema = z.array(PlanTaskSchema).min(1);
export type PlanTask = z.infer<typeof PlanTaskSchema>;

export const PerformanceSignalSchema = z.object({
  page: z.string().min(1),
  interaction: z.string().min(1),
  inpMs: z.number().nonnegative(),
  p75InpMs: z.number().nonnegative(),
  longTaskMs: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});
export type PerformanceSignal = z.infer<typeof PerformanceSignalSchema>;

export const HypothesisSchema = z.object({
  id: z.string().min(1),
  cause: z.string().min(1),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string().min(1),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const PatchProposalSchema = z.object({
  targetFiles: z.array(z.string().min(1)).min(1),
  diffSummary: z.string().min(1),
  risk: SeveritySchema,
});
export type PatchProposal = z.infer<typeof PatchProposalSchema>;

export const VerificationResultSchema = z.object({
  passed: z.boolean(),
  inpBefore: z.number().nonnegative(),
  inpAfter: z.number().nonnegative(),
  notes: z.string().min(1),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

export const GovernanceDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().min(1),
  requiresHumanReview: z.boolean(),
});
export type GovernanceDecision = z.infer<typeof GovernanceDecisionSchema>;

export const ReactStepSchema = z.object({
  phase: z.enum(["profile", "fix", "verify"]),
  attempt: z.number().int().min(1),
  thought: z.string().min(1),
  action: z.string().min(1),
  observation: z.string().min(1),
  status: z.enum(["success", "error"]),
  timestamp: z.string().datetime(),
});
export const ReactTraceSchema = z.array(ReactStepSchema);
export type ReactStep = z.infer<typeof ReactStepSchema>;

export const WorkflowResultSchema = z.object({
  signal: PerformanceSignalSchema,
  hypothesis: HypothesisSchema,
  patch: PatchProposalSchema,
  verification: VerificationResultSchema,
  governance: GovernanceDecisionSchema,
  reactTrace: ReactTraceSchema,
});
export type WorkflowResult = z.infer<typeof WorkflowResultSchema>;

export const PatchDiffSummarySchema = z.string().min(1);
export const VerificationToolResultSchema = z.object({
  inpAfter: z.number().nonnegative(),
  passed: z.boolean(),
});

function zodIssueToString(path: string, message: string): string {
  const field = path.length > 0 ? path : "(root)";
  return `${field}: ${message}`;
}

export function parseWithSchema<S extends z.ZodType>(schema: S, value: unknown, label: string): z.infer<S> {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  const details = parsed.error.issues
    .map((issue) => zodIssueToString(issue.path.join("."), issue.message))
    .join("; ");
  throw new Error(`[schema:${label}] ${details}`);
}
