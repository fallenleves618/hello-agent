import { Hypothesis, HypothesisSchema, parseWithSchema, PerformanceSignal } from "../types/contracts.js";

export class HypothesisAgent {
  generate(signal: PerformanceSignal): Hypothesis {
    const cause = signal.longTaskMs > 200
      ? "Main-thread long task in click handler blocks next paint"
      : "Likely render thrash caused by synchronous state updates";

    const suggestedFix = signal.longTaskMs > 200
      ? "Split click handler work with scheduler.postTask/yield and move non-critical work to idle callback"
      : "Batch state updates and memoize expensive selector computations";

    return parseWithSchema(HypothesisSchema, {
      id: `hyp-${Date.now()}`,
      cause,
      confidence: 0.82,
      suggestedFix,
    }, "agent.hypothesis.output");
  }
}
