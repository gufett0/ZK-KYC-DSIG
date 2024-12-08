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
import { sha256Pad } from "@zk-email/helpers";

interface Pkcs7FormattedData {
  PublicKeyModulus: string[];
  CaPublicKeyModulus: string[];
  JudgePublicKeyModulus: string[];
  Signature: string[];
  CertificateSignature: string[];
  SignedAttributes: string[];
  SignedAttributesLength: string;
  CertificateTbsLength: string;
  Content: string[];
  MessageDigest: string[];
  CertificateTbs: string[];
  Exponent: string;
}

export default class FormatHandler {
  private Data!: Pkcs7Data;
  private MaxSignAttributesLength!: number;
  private MaxTbsLength!: number;
  constructor(data: Pkcs7Data, maxSignAttributesByteLength: number, maxTbsByteLength: number) {
    if (data === null) {
      throw new Error("Data from signed file is null");
    }
    // Check if the maxSignAttributesByteLength is a multiple of 64 and so the bit value is a multiple of 512
    if (maxSignAttributesByteLength < 64 || maxSignAttributesByteLength % 64 !== 0) {
      throw new Error("Invalid maxSignAttributesLength");
    }
    if (maxTbsByteLength < 64 || maxTbsByteLength % 64 !== 0) {
      throw new Error("Invalid maxTbsByteLength");
    }
    this.Data = data;
    this.MaxSignAttributesLength = maxSignAttributesByteLength;
    this.MaxTbsLength = maxTbsByteLength;
  }
  public getFormattedDataForKzpCircuit(): Pkcs7FormattedData {
    const publicKeyModulus: string[] = toCircomBigIntBytes(this.Data.PublicKeyModulus);
    const caPublicKeyModulus: string[] = toCircomBigIntBytes(this.Data.CaPublicKeyModulus);
    const signature: string[] = toCircomBigIntBytes(this.Data.Signature);
    const certificateSignature: string[] = toCircomBigIntBytes(this.Data.CertificateSignature);
    const [signedAttributesPadded, signedAttributesPaddedLength] = sha256Pad(
      this.Data.SignedAttributes,
      this.MaxSignAttributesLength
    );
    const signedAttributesPaddedString: string[] = Uint8ArrayToCharArray(signedAttributesPadded);
    const [certificateTbsPadded, certificateTbsPaddedLength] = sha256Pad(this.Data.CertificateTbs, this.MaxTbsLength);
    const certificateTbsPaddedString: string[] = Uint8ArrayToCharArray(certificateTbsPadded);
    const messageDigest: string[] = Uint8ArrayToCharArray(this.Data.MessageDigest);
    const content: string[] = Uint8ArrayToCharArray(this.Data.Content);
    const exponent: string = this.Data.Exponent.toString();
    const judgePublicKeyModulus: string[] = toCircomBigIntBytes(this.Data.JudgePublicKeyModulus);
    return {
      PublicKeyModulus: publicKeyModulus,
      CaPublicKeyModulus: caPublicKeyModulus,
      JudgePublicKeyModulus: judgePublicKeyModulus,
      Signature: signature,
      CertificateSignature: certificateSignature,
      SignedAttributes: signedAttributesPaddedString,
      SignedAttributesLength: signedAttributesPaddedLength.toString(),
      CertificateTbs: certificateTbsPaddedString,
      CertificateTbsLength: certificateTbsPaddedLength.toString(),
      MessageDigest: messageDigest,
      Content: content,
      Exponent: exponent,
    };
  }
}

const a = new pkcs7data(
  Common.readFileToBinaryBuffer("../../files/prova.txt.p7m"),
  Common.readFileToBinaryBuffer("../../files/PosteItalianeEUQualifiedCertificatesCA.cer"),
  Common.readFileToBinaryString("../../files/JudgePublicKey.pem")
);
const b = new FormatHandler(a.getPkcs7DataForZkpKyc(), 512, 2048);
