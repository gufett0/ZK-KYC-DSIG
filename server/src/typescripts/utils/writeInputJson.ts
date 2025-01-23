import RSA from "@utils/rsa";
import Common from "@utils/common";
import FormatHandler from "@signature/formatHandler";
import pkcs7data from "@signature/pkcs7Handler";

const data = "GRDNNA66L65B034A";
const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";

const formattedDataForCircuit = new FormatHandler(
  new pkcs7data(
    Common.readFileToBinaryBuffer("../../files/kyc.txt.p7m"),
    Common.readFileToBinaryBuffer("../../files/ArubaPECS.p.A.NGCA3.cer"),
    Common.readFileToUTF8String("../../files/JudgePublicKey.pem")
  ).getPkcs7DataForZkpKyc(),
  512,
  2048,
  RSA.packMessage(salt, data),
  RSA.packMessageAndPad(salt, data)
).getFormattedDataForKzpCircuit();

Common.writeFile("../../circuits/ZkpKycDigSig/input.json", JSON.stringify(formattedDataForCircuit, null, 2));
