import path from "path";
import ExecuteScriptForTest from "@/utils/executescriptfortest";
import WriteTxt from "@/utils/writetxtfortest";
import logger from "@/utils/logger";

describe("CreateFileAndSign", () => {
  beforeAll(() => {
    logger.info("Starting tests");
  });
  beforeEach(() => {});
  afterEach(() => {
    logger.info("Done");
  });
  afterAll(() => {
    logger.info("Ending tests");
  });
  test(
    "Generate file to be signed",
    (done) => {
      const data = "SVNMTT98E15B034I";
      const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
      const pemPath = "../../../files/JudgePublicKey.pem";
      const outputPath = "../../../files/data.txt";
      logger.info("Generating file to be signed");
      new WriteTxt(data, salt, path.resolve(__dirname, pemPath), path.resolve(__dirname, outputPath));
      done();
    },
    5 * 60 * 1000
  );
  test(
    "Generate certificate of CA",
    (done) => {
      const data = "SVNMTT98E15B034I";
      const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
      const pemPath = "../../../files/JudgePublicKey.pem";
      const outputPath = "../../../files/data.txt";
      logger.info("Generating file to be signed");
      new WriteTxt(data, salt, path.resolve(__dirname, pemPath), path.resolve(__dirname, outputPath));
      done();
    },
    5 * 60 * 1000
  );
  test(
    "Sign file",
    (done) => {
      const data = "SVNMTT98E15B034I";
      const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
      const pemPath = "../../../files/JudgePublicKey.pem";
      const outputPath = "../../../files/data.txt";
      logger.info("Generating file to be signed");
      new WriteTxt(data, salt, path.resolve(__dirname, pemPath), path.resolve(__dirname, outputPath));
      done();
    },
    5 * 60 * 1000
  );
});
