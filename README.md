# hello-agent

A frontend performance autonomous multi-agent project (INP-first).

## What this initial version includes

- 6 specialized agents:
- `PlannerAgent`
- `ProfilerAgent`
- `HypothesisAgent`
- `FixerAgent`
- `VerifierAgent`
- `GovernorAgent`
- `ReactorAgent` for bounded ReAct loops on `profile/fix/verify`
- MCP client abstraction with a `MockMcpClient`
- One end-to-end workflow: `Observe -> Hypothesize -> Act -> Verify -> Govern`
- In-memory knowledge store (`MemoryStore`) for iteration summary

## Architecture

```text
Planner -> Profiler -> Hypothesis -> Fixer -> Verifier -> Governor
                 \___________________ MemoryStore _______________/
```

## Quick Start

```bash
cd /Users/yizhou.wu/hello-agent
cp .env.example .env
npm install
npm run dev -- /checkout
```

## Current Scope

- Initial version uses mock tooling only (`MOCK_MODE=true`)
- ReAct is enabled by default and controlled via `ENABLE_REACT` / `REACT_MAX_STEPS`
- Real MCP server integration and real patch application are TODO
- No OpenAI SDK runtime wiring yet (added in next milestone)

## Suggested Next Milestones

1. Implement real MCP tools (`trace_collect`, `lighthouse_run`, `patch_apply`, `ci_verify`).
2. Add OpenAI Agents SDK orchestration for each role agent.
3. Persist memory to SQLite/Postgres and add retrieval by page+interaction.
4. Add policy gates (risk score, rollback rules, human-review threshold).

See [docs/ROADMAP.md](./docs/ROADMAP.md) for an 8-week plan.
