import RSA from "@utils/rsa";
import Common from "@utils/common";
import FormatHandler from "@signature/formatHandler";
import pkcs7data from "@signature/pkcs7Handler";

export default class WriteTxt {
  private data: string;
  private salt: string;
  private path: string;
  private pemPath: string;

  constructor(data: string, salt: string, pemPath: string, path: string) {
    this.data = data;
    this.salt = salt;
    this.path = path;
    this.pemPath = pemPath;
    this.writeTxt();
  }

  private writeTxt(): void {
    const encryptedData: string = RSA.rsaRawEncrypt(
      RSA.packMessageAndPad(this.salt, this.data),
      Common.readFileToUTF8String(this.pemPath)
    );
    Common.writeFile(this.path, encryptedData);
    expect(Common.checkFileExists(this.path)).toBe(true);
  }
}
