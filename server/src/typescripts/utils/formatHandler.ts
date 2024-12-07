import Common from "@utils/common";
import pkcs7data, { Pkcs7Data } from "@utils/pkcs7Handler";
import {
  Uint8ArrayToCharArray,
  Uint8ArrayToString,
  bufferToString,
  bufferToUint8Array,
  bytesToString,
  toCircomBigIntBytes,
} from "@zk-email/helpers";

/*export interface Pkcs7Data {
  PublicKeyModulus: BigInt;
  CaPublicKeyModulus: BigInt;
  Signature: BigInt;
  SignedAttributes: Buffer;
  Content: string;
  MessageDigest: Buffer;
  CertificateTbs: Buffer;
  CertificateSignature: BigInt;
} */

export default class FormatHandler {
  private Data!: Pkcs7Data;
  private MaxSignAttributesLength!: number;
  constructor(data: Pkcs7Data, maxSignAttributesByteLength: number) {
    if (data === null) {
      throw new Error("Data from signed file is null");
    }
    // Check if the maxSignAttributesByteLength is a multiple of 64 and so the bit value is a multiple of 512
    if (maxSignAttributesByteLength < 64 || maxSignAttributesByteLength % 64 !== 0) {
      throw new Error("Invalid maxSignAttributesLength");
    }
    this.Data = data;
    this.MaxSignAttributesLength = maxSignAttributesByteLength;
  }
  public getFormattedDataForKzpCircuit() {
    const publicKeyModulus: string[] = toCircomBigIntBytes(this.Data.PublicKeyModulus);
    return { asd: "" };
  }
}

const a = new pkcs7data(
  Common.readFileToBinaryBuffer("../temp/prova.txt.p7m"),
  Common.readFileToBinaryBuffer("../temp/PosteItalianeEUQualifiedCertificatesCA.crt")
);
