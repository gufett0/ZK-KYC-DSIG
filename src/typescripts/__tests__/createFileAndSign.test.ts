import path from "path";
import ExecuteScriptForTest from "@/utils/executescriptfortest";
import WriteTxt from "@/utils/writetxtfortest";
import logger from "@/utils/logger";

describe("CreateFileAndSign", () => {
  let scriptPath: string;
  beforeAll(() => {
    scriptPath = path.join(__dirname, "../../../", "./GenerateCertsAndSignFile.ps1");
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
    "Write file",
    (done) => {
      const data = "SVNMTT98E15B034I";
      const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
      const pemPath = "../../../files/JudgePublicKey.pem";
      const outputPath = "../../../files/data.txt";
      new WriteTxt(data, salt, path.resolve(__dirname, pemPath), path.resolve(__dirname, outputPath));
      done();
    },
    5 * 60 * 1000
  );
  test(
    "Generate certificate of CA",
    (done) => {
      logger.info("CA Cert");
      ExecuteScriptForTest.runScript(scriptPath, [], done);
    },
    5 * 60 * 1000
  );
  test(
    "Sign file",
    (done) => {
      logger.info("Sign");
      ExecuteScriptForTest.runScript(scriptPath, [], done);
    },
    5 * 60 * 1000
  );
});
