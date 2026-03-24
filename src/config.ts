export interface AppConfig {
  mcpServerUrl: string;
  logLevel: "debug" | "info" | "warn" | "error";
  mockMode: boolean;
}

const LOG_LEVELS = new Set(["debug", "info", "warn", "error"]);

export function loadConfig(): AppConfig {
  const rawLevel = process.env.LOG_LEVEL ?? "info";
  const logLevel = LOG_LEVELS.has(rawLevel) ? (rawLevel as AppConfig["logLevel"]) : "info";

  return {
    mcpServerUrl: process.env.MCP_SERVER_URL ?? "http://localhost:8787",
    logLevel,
    mockMode: (process.env.MOCK_MODE ?? "true").toLowerCase() === "true",
  };
}
