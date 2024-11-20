import Static from "@utils/static";
import logger from "@logger";
import { readFileSync } from "fs";
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
}
