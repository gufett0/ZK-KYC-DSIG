import dotenv from "dotenv";
import logger, { exitLog } from "@logger";
import { Level, levels } from "log4js";

class Config {
  private static instance?: Config;

  public readonly SERVER_PORT: Number;
  public readonly LOG_LEVEL: Level;
  public readonly ENV: "production" | "development";

  static getInstance(): Config {
    if (!this.instance) this.instance = new Config();
    return this.instance;
  }

  constructor() {
    const env = dotenv.config();
    if (env.error) exitLog("Missing environment file or bad .env");
    this.ENV = "production";
    if (!process.env.NODE_ENV || process.env.NODE_ENV.includes("dev")) this.ENV = "development";
    logger.info(`Environment set to: ${this.ENV}`);
    this.LOG_LEVEL = this.parseLogLevel();
    logger.info(`Setting log level to: ${this.LOG_LEVEL}`);
    this.SERVER_PORT = this.parseServerPort();
    logger.info(`Setting server port to: ${this.SERVER_PORT}`);
  }

  private parseLogLevel(): Level {
    let log = "";
    if (!process.env.ZKP_LOG_LEVEL) exitLog(`Missing LOG_LEVEL in .env`);
    log = process.env.ZKP_LOG_LEVEL.toUpperCase();
    switch (log) {
      case "DEBUG":
        return levels.DEBUG;
      case "INFO":
        return levels.INFO;
      case "WARN":
        return levels.WARN;
      case "ERROR":
        return levels.ERROR;
      case "FATAL":
        return levels.FATAL;
      case "OFF":
        return levels.OFF;
      case "ALL":
        return levels.ALL;
      default:
        return exitLog(`Invalid LOG_LEVEL in .env`);
    }
  }

  private parseServerPort(): Number {
    let port = 3000;
    if (!process.env.ZKP_SERVER_PORT) return port;
    port = parseInt(process.env.ZKP_SERVER_PORT);
    if (isNaN(port)) exitLog(`Invalid PORT in .env`);
    return port;
  }
}

export default Config.getInstance();
