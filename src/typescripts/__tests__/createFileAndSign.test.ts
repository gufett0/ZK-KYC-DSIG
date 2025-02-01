import path from "path";
import ExecuteScriptForTest from "@/utils/executescriptfortest";
import WriteTxt from "@/utils/writetxtfortest";
import logger from "@/utils/logger";

describe("CreateFileAndSign", () => {
  let scriptPath: string;
  let fiscalCode: string;
  let filesPath: string;
  let txtPath: string;
  beforeAll(() => {
    scriptPath = path.join(__dirname, "../../../", "./GenerateCertsAndSignFile.ps1");
    fiscalCode = "SVNMTT98E15B034I";
    filesPath = "../../../files/two/";
    txtPath = "../../../files/two/data.txt";
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
      const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
      const pemPath = "../../../files/two/JudgePublicKey.pem";
      new WriteTxt(fiscalCode, salt, path.resolve(__dirname, pemPath), path.resolve(__dirname, txtPath));
      done();
    },
    5 * 60 * 1000
  );
  test(
    "Generate certificate of CA",
    (done) => {
      logger.info("CA Cert");
      ExecuteScriptForTest.runScript(
        scriptPath,
        [
          "-FiscalCode",
          fiscalCode,
          "-FilesPath",
          path.resolve(__dirname, filesPath),
          "-DocumentPath",
          path.resolve(__dirname, txtPath),
        ],
        done
      );
    },
    5 * 60 * 1000
  );
});
