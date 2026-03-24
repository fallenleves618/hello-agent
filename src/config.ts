export interface AppConfig {
  mcpServerUrl: string;
  logLevel: "debug" | "info" | "warn" | "error";
  mockMode: boolean;
  enableReact: boolean;
  reactMaxSteps: number;
}

const LOG_LEVELS = new Set(["debug", "info", "warn", "error"]);

export function loadConfig(): AppConfig {
  const rawLevel = process.env.LOG_LEVEL ?? "info";
  const logLevel = LOG_LEVELS.has(rawLevel) ? (rawLevel as AppConfig["logLevel"]) : "info";
  const reactMaxSteps = Number.parseInt(process.env.REACT_MAX_STEPS ?? "3", 10);

  return {
    mcpServerUrl: process.env.MCP_SERVER_URL ?? "http://localhost:8787",
    logLevel,
    mockMode: (process.env.MOCK_MODE ?? "true").toLowerCase() === "true",
    enableReact: (process.env.ENABLE_REACT ?? "true").toLowerCase() === "true",
    reactMaxSteps: Number.isFinite(reactMaxSteps) && reactMaxSteps > 0 ? reactMaxSteps : 3,
  };
}
