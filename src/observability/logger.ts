import { AppConfig } from "../config.js";

type Level = AppConfig["logLevel"];

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  constructor(private readonly level: Level) {}

  debug(message: string, payload?: unknown): void {
    this.log("debug", message, payload);
  }

  info(message: string, payload?: unknown): void {
    this.log("info", message, payload);
  }

  warn(message: string, payload?: unknown): void {
    this.log("warn", message, payload);
  }

  error(message: string, payload?: unknown): void {
    this.log("error", message, payload);
  }

  private log(level: Level, message: string, payload?: unknown): void {
    if (levelOrder[level] < levelOrder[this.level]) return;
    const ts = new Date().toISOString();
    if (payload === undefined) {
      console.log(`[${ts}] [${level}] ${message}`);
      return;
    }
    console.log(`[${ts}] [${level}] ${message}`, payload);
  }
}
