# Roadmap (8 Weeks)

## Week 1-2: Foundation

- Keep current 6-agent topology.
- Replace `MockMcpClient` with concrete MCP transport.
- Add structured JSON logs for all agent steps.

Deliverable: a reproducible mock-to-real data path.

## Week 3-4: Deep INP Diagnosis

- Parse RUM + trace signals into a root-cause schema.
- Add confidence scoring and evidence links per hypothesis.
- Add a ranked fix pattern library.

Deliverable: top-1 root-cause hypothesis with confidence and evidence.

## Week 5-6: Safe Auto-Remediation

- Generate minimal patch proposals with guardrails.
- Add test + performance verification gate.
- Add rollback and retry strategy.

Deliverable: automatically generated PR draft with verification report.

## Week 7-8: Productionization

- Persistent memory and retrieval across runs.
- CI budget gating for INP/LCP/CLS regression.
- Dashboard for acceptance rate and performance gain trend.

Deliverable: continuous optimization loop for selected frontend pages.
