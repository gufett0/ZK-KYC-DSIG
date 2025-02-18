import path from "path";
import ExecuteScriptForTest from "@/utils/executescriptfortest";
import WriteInputJson from "@/utils/writeInputJson";
import logger from "@/utils/logger";

describe("ProveAndVerifyTwo", () => {
  let scriptPath: string;
  let circuitPath: string;
  let circuitName: string;
  beforeAll(() => {
    const data = "SVNMTT98E15B034I";
    const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
    const p7mPath = "../../../files/two/data.txt.p7m";
    const cerPath = "../../../files/two/RootCA.cer";
    const pemPath = "../../../files/two/JudgePublicKey.pem";
    const outputPath = "../../circuits/test_2/input.json";
    scriptPath = path.join(__dirname, "../../../", "./GenerateProofAndVerifyIt.ps1");
    circuitPath = path.join(__dirname, "../../../", "./src/circuits/");
    circuitName = "ZkpKycDigSig";
    logger.info("Generating input.json file");
    new WriteInputJson(
      data,
      salt,
      path.resolve(__dirname, p7mPath),
      path.resolve(__dirname, cerPath),
      path.resolve(__dirname, pemPath),
      path.resolve(__dirname, outputPath)
    );
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
    "Generate proof and witness",
    (done) => {
      logger.info("Proof");
      ExecuteScriptForTest.runScript(
        scriptPath,
        ["-CircuitName", "ZkpKycDigSig", "-CircuitDir", circuitPath, "-Proof", "-Test2"],
        done
      );
    },
    30 * 60 * 1000
  );
  test(
    "Verify proof",
    (done) => {
      logger.info("Verify");
      ExecuteScriptForTest.runScript(
        scriptPath,
        ["-CircuitName", "ZkpKycDigSig", "-CircuitDir", circuitPath, "-Verify", "-Test2"],
        done
      );
    },
    30 * 60 * 100
  );
});
