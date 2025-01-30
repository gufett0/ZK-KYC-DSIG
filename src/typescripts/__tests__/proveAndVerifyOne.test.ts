import path from "path";
import ExecuteScriptForTest from "@/utils/executescriptfortest";
import WriteInputJson from "@/utils/writeinputjson";
import logger from "@/utils/logger";

describe("ProofAndVerifyOne", () => {
  let scriptPath: string;
  let circuitPath: string;
  let circuitName: string;
  beforeAll(() => {
    const data = "GRDNNA66L65B034A";
    const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
    const p7mPath = "../../../files/kyc.txt.p7m";
    const cerPath = "../../../files/ArubaPECS.p.A.NGCA3.cer";
    const pemPath = "../../../files/JudgePublicKey.pem";
    const outputPath = "../../circuits/test_1/input.json";
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
        ["-CircuitName", "ZkpKycDigSig", "-CircuitDir", circuitPath, "-Proof", "-Test1"],
        done
      );
    },
    20 * 60 * 1000
  );
  test(
    "Verify proof",
    (done) => {
      logger.info("Verify");
      ExecuteScriptForTest.runScript(
        scriptPath,
        ["-CircuitName", "ZkpKycDigSig", "-CircuitDir", circuitPath, "-Verify", "-Test1"],
        done
      );
    },
    5 * 60 * 100
  );
});
