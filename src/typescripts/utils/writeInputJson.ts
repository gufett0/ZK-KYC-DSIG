import RSA from "@utils/rsa";
import Common from "@utils/common";
import FormatHandler from "@signature/formatHandler";
import pkcs7data from "@signature/pkcs7Handler";

export default class WriteInputJson {
  private data: string;
  private salt: string;
  private p7mPath: string;
  private cerPath: string;
  private pemPath: string;
  private outputPath: string;

  constructor(data: string, salt: string, p7mPath: string, cerPath: string, pemPath: string, outputPath: string) {
    this.data = data;
    this.salt = salt;
    this.p7mPath = p7mPath;
    this.cerPath = cerPath;
    this.pemPath = pemPath;
    this.outputPath = outputPath;
    this.writeInputJson();
  }

  private writeInputJson(): void {
    const formattedDataForCircuit = new FormatHandler(
      new pkcs7data(
        Common.readFileToBinaryBuffer(this.p7mPath),
        Common.readFileToBinaryBuffer(this.cerPath),
        Common.readFileToUTF8String(this.pemPath)
      ).getPkcs7DataForZkpKyc(),
      512,
      2048,
      RSA.packMessage(this.salt, this.data),
      RSA.packMessageAndPad(this.salt, this.data)
    ).getFormattedDataForKzpCircuit();
    Common.writeFile(this.outputPath, JSON.stringify(formattedDataForCircuit, null, 2));
  }
}
