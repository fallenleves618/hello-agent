import { parseWithSchema, ReactStep, ReactStepSchema } from "../types/contracts.js";

type ReactPhase = "profile" | "fix" | "verify";

interface RunReactOptions<T> {
  phase: ReactPhase;
  enabled: boolean;
  maxSteps: number;
  action: (attempt: number) => Promise<T>;
  summarize: (result: T, attempt: number) => string;
}

interface ReactRunResult<T> {
  result: T;
  trace: ReactStep[];
}

export class ReactorAgent {
  // Run a bounded ReAct loop so each critical phase can retry with explicit observations.
  async run<T>(options: RunReactOptions<T>): Promise<ReactRunResult<T>> {
    const trace: ReactStep[] = [];

    if (!options.enabled) {
      const result = await options.action(1);
      trace.push(this.makeStep(options.phase, 1, "ReAct disabled, execute once", "single execution", options.summarize(result, 1), "success"));
      return { result, trace };
    }

    let lastError: unknown = new Error("ReAct run did not execute");

    for (let attempt = 1; attempt <= options.maxSteps; attempt += 1) {
      const thought = this.buildThought(options.phase, attempt);
      const action = this.buildAction(options.phase, attempt);

      try {
        const result = await options.action(attempt);
        trace.push(this.makeStep(options.phase, attempt, thought, action, options.summarize(result, attempt), "success"));
        return { result, trace };
      } catch (error: unknown) {
        lastError = error;
        const observation = this.errorToMessage(error);
        trace.push(this.makeStep(options.phase, attempt, thought, action, observation, "error"));
      }
    }

    throw new Error(`[react:${options.phase}] failed after ${options.maxSteps} attempts. lastError=${this.errorToMessage(lastError)}`);
  }

  private buildThought(phase: ReactPhase, attempt: number): string {
    if (attempt === 1) {
      return `Start ${phase} with default strategy`;
    }
    return `Retry ${phase} after previous observation indicates failure`;
  }

  private buildAction(phase: ReactPhase, attempt: number): string {
    return `execute_${phase}_tool_attempt_${attempt}`;
  }

  private makeStep(
    phase: ReactPhase,
    attempt: number,
    thought: string,
    action: string,
    observation: string,
    status: "success" | "error",
  ): ReactStep {
    return parseWithSchema(ReactStepSchema, {
      phase,
      attempt,
      thought,
      action,
      observation,
      status,
      timestamp: new Date().toISOString(),
    }, "react.step");
  }

  private errorToMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
