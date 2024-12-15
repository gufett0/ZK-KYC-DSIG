import Static from "@utils/static";
import logger from "@logger";
import { readFileSync, writeFileSync } from "fs";
import crypto from "crypto";
import forge from "node-forge";

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

  public static hashString(input: string | Buffer): any {
    let hasher = crypto.createHash("SHA256");
    hasher.update(input);
    return hasher.digest("hex");
  }

  public static getPubKeyModulusFromPemCertificate(pemFormatCertificateString: string): string {
    try {
      const publicKey: forge.pki.rsa.PublicKey = forge.pki.publicKeyFromPem(
        forge.pki.publicKeyToPem(forge.pki.certificateFromPem(pemFormatCertificateString).publicKey).toString()
      );
      return publicKey.n.toString();
    } catch (err) {
      logger.error("Error extracting public key from PEM certificate:", err);
      return "";
    }
  }

  public static generateRSAKeyPair() {
    const keyPair = forge.pki.rsa.generateKeyPair({
      bits: 2048,
      e: 0x10001,
    });
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKeyAsn1 = forge.pki.privateKeyToAsn1(keyPair.privateKey);
    const privateKeyPkcs8Asn1 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
    const privateKeyPkcs8Pem = forge.pki.privateKeyInfoToPem(privateKeyPkcs8Asn1);

    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPkcs8Pem,
    };
  }

  public static writeKeyPairToDisk(publicKeyPath: string, privateKeyPath: string) {
    const { publicKey, privateKey } = this.generateRSAKeyPair();
    try {
      Common.writeFile(publicKeyPath, publicKey, "utf8");
      logger.info(`Public key written to ${publicKeyPath}`);

      Common.writeFile(privateKeyPath, privateKey, "utf8");
      logger.info(`Private key written to ${privateKeyPath}`);
    } catch (error) {
      logger.error("Error writing keys to disk:", error);
    }
  }

  public static convertBufferToBitArray(buffer: Buffer): number[] {
    const bitArray: number[] = [];
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      for (let j = 7; j >= 0; j--) {
        bitArray.push((byte >> j) & 1);
      }
    }
    return bitArray;
  }
}
