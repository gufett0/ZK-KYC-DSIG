import Static from "@utils/static";
import logger from "@logger";
import { readFileSync, writeFileSync } from "fs";
import crypto from "crypto";
export default class Common extends Static {
  constructor() {
    super();
  }

  public static readFileToUTF8String(filePath: string): string {
    try {
      return readFileSync(filePath, "utf-8");
    } catch (error) {
      logger.error(`Error reading file: ${error}`);
      return "";
    }
  }

  public static readFileToBinaryBuffer(filePath: string): Buffer {
    try {
      return readFileSync(filePath);
    } catch (error) {
      logger.error(`Error reading file: ${error}`);
      return Buffer.alloc(0);
    }
  }

  public static readFileToBinaryString(filePath: string): string {
    try {
      return readFileSync(filePath, "binary");
    } catch (error) {
      logger.error(`Error reading file: ${error}`);
      return "";
    }
  }

  public static writeFile(filePath: string, data: string, encoding: BufferEncoding = "utf-8"): boolean {
    try {
      writeFileSync(filePath, data, { encoding });
      logger.info(`File written successfully to ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Error writing file: ${error}`);
      return false;
    }
  }

  public static hashString(input: string | Buffer): string {
    let hasher = crypto.createHash("SHA256");
    hasher.update(input);
    return hasher.digest("hex");
  }
}
