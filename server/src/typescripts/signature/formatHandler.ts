import Common from "@utils/common";
import pkcs7data, { Pkcs7Data } from "@signature/pkcs7Handler";
import {
  Uint8ArrayToCharArray,
  toCircomBigIntBytes,
  padUint8ArrayWithZeros,
  bigIntToChunkedBytes,
} from "@zk-email/helpers";
import { sha256Pad } from "@zk-email/helpers";
import RSA from "@utils/rsa";
import forge from "node-forge";

interface Pkcs7FormattedData {
  SignedAttributes: string[];
  SignedAttributesLength: string;
  Signature: string[];
  PublicKeyModulus: string[];
  CertificateTbs: string[];
  CertificateTbsLength: string;
  CertificateSignature: string[];
  CaPublicKeyModulus: string[];
  JudgePublicKeyModulus: string[];
  MessageDigestPatternStartingIndex: string;
  Content: string[];
  DecryptedContent: string[];
  DecryptedContentLength: string;
  FiscalCodeIndexInDecryptedContent: string;
  FiscalCodePatternStartingIndexInTbs: string;
  PublicKeyModulusPatternStartingIndexInTbs: string;
}

export default class FormatHandler {
  private Data!: Pkcs7Data;
  private MaxSignAttributesLength!: number;
  private MaxTbsLength!: number;
  private DecryptedContent!: string;
  private DecryptedContentBuffer!: Buffer;

  constructor(
    data: Pkcs7Data,
    maxSignAttributesByteLength: number,
    maxTbsByteLength: number,
    decryptedContent: string,
    decryptedContentBuffer: Buffer
  ) {
    if (!data) {
      throw new Error("Data from signed file is null");
    }
    // Check if the maxSignAttributesByteLength is a multiple of 64 and so the bit value is a multiple of 512
    if (!maxSignAttributesByteLength || maxSignAttributesByteLength < 64 || maxSignAttributesByteLength % 64 !== 0) {
      throw new Error("Invalid maxSignAttributesLength");
    }
    if (!maxTbsByteLength || maxTbsByteLength < 64 || maxTbsByteLength % 64 !== 0) {
      throw new Error("Invalid maxTbsByteLength");
    }
    if (!decryptedContent || decryptedContent.length <= 16) {
      throw new Error("Invalid decrypted content length");
    }
    if (!decryptedContentBuffer || decryptedContentBuffer.length < 256) {
      throw new Error("Invalid decrypted content buffer length");
    }
    this.Data = data;
    this.MaxSignAttributesLength = maxSignAttributesByteLength;
    this.MaxTbsLength = maxTbsByteLength;
    this.DecryptedContent = decryptedContent;
    this.DecryptedContentBuffer = decryptedContentBuffer;
  }

  private extractMessageDigestPatternStartingIndex(signedAttributesPaddedString: string[]): number {
    let messageDigestPattern = [6, 9, 42, 134, 72, 134, 247, 13, 1, 9, 4, 49, 34, 4, 32];

    const sigendAttributes = signedAttributesPaddedString.map(Number);

    return sigendAttributes.findIndex(
      (_, i) =>
        i + messageDigestPattern.length <= sigendAttributes.length &&
        messageDigestPattern.every((patternValue, j) => sigendAttributes[i + j] === patternValue)
    );
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
    const messageDigestPatternStartingIndex: string =
      this.extractMessageDigestPatternStartingIndex(signedAttributesPaddedString).toString();
    const exponent: string = this.Data.Exponent.toString();
    const judgePublicKeyModulus: string[] = toCircomBigIntBytes(this.Data.JudgePublicKeyModulus);
    const content: string[] = Uint8ArrayToCharArray(this.Data.Content);
    const decryptedContent: string[] = Uint8ArrayToCharArray(this.DecryptedContentBuffer);
    const decryptedContentLength: string = (this.DecryptedContent.indexOf('"}', 16) + '"}'.length).toString();
    const fiscalCodeIndexInDecryptedContent: string = (
      256 -
      this.DecryptedContent.length +
      this.DecryptedContent.indexOf('","data":"', 8) +
      '","data":"'.length
    ).toString();
    const fiscalCodePatternInTbs = [
      // (1) OID: 06 03 55 04 05
      "6",
      "3",
      "85",
      "4",
      "5",
      // (2) Tag for PrintableString (0x13):
      "19",
      // (3) Length (6 TINIT- + 16 FISCAL CODE):
      "22",
      // (4) First 6 bytes for "TINIT-" (Modify it for other countries)
      "84",
      "73",
      "78",
      "73",
      "84",
      "45",
    ];
    const fiscalCodePatternStartingIndexInTbs: number = certificateTbsPaddedString.findIndex((_, i) => {
      if (i + fiscalCodePatternInTbs.length > certificateTbsPaddedString.length) return false;
      return fiscalCodePatternInTbs.every((p, j) => certificateTbsPaddedString[i + j] === p);
    });
    const publicKeyModulusPatternInTbs = [
      // (1) RSA OID:  06 09 2A 86 48 86 F7 0D 01 01 01
      "6",
      "9",
      "42",
      "134",
      "72",
      "134",
      "247",
      "13",
      "1",
      "1",
      "1",
      // (2) NULL parameters: 05 00
      "5",
      "0",
      // (3) BIT STRING tag & length: 03 82 01 0F
      "3",
      "130",
      "1",
      "15",
      // (4) Unused bits in BIT STRING: 00
      "0",
      // (5) SEQUENCE (RSAPublicKey) tag & length: 30 82 01 0A
      "48",
      "130",
      "1",
      "10",
      // (6) INTEGER (modulus) tag & length: 02 82 01 01
      "2",
      "130",
      "1",
      "1",
      // (7) Leading 0 byte for the INTEGER
      "0",
    ];
    const publicKeyModulusPatternStartingIndexInTbs: number = certificateTbsPaddedString.findIndex((_, i) => {
      if (i + publicKeyModulusPatternInTbs.length > certificateTbsPaddedString.length) return false;
      return publicKeyModulusPatternInTbs.every((p, j) => certificateTbsPaddedString[i + j] === p);
    });

    return {
      SignedAttributes: signedAttributesPaddedString,
      SignedAttributesLength: signedAttributesPaddedLength.toString(),
      Signature: signature,
      PublicKeyModulus: publicKeyModulus,
      CertificateTbs: certificateTbsPaddedString,
      CertificateTbsLength: certificateTbsPaddedLength.toString(),
      CertificateSignature: certificateSignature,
      CaPublicKeyModulus: caPublicKeyModulus,
      JudgePublicKeyModulus: judgePublicKeyModulus,
      MessageDigestPatternStartingIndex: messageDigestPatternStartingIndex.toString(),
      Content: content,
      DecryptedContent: decryptedContent,
      DecryptedContentLength: decryptedContentLength.toString(),
      FiscalCodeIndexInDecryptedContent: fiscalCodeIndexInDecryptedContent.toString(),
      FiscalCodePatternStartingIndexInTbs: fiscalCodePatternStartingIndexInTbs.toString(),
      PublicKeyModulusPatternStartingIndexInTbs: publicKeyModulusPatternStartingIndexInTbs.toString(),
    };
  }
}

const data = "GRDNNA66L65B034A";
const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";
const saltHash = "c21f05dfc277571930159cf254c403323fe9c82010ee640c3342098e58c75e0b";
const saltHashHex = Common.hashString(salt);

const a = new pkcs7data(
  Common.readFileToBinaryBuffer("../../files/kyc.txt.p7m"),
  Common.readFileToBinaryBuffer("../../files/ArubaPECS.p.A.NGCA3.cer"),
  Common.readFileToUTF8String("../../files/JudgePublicKey.pem")
);

const b = new FormatHandler(
  a.getPkcs7DataForZkpKyc(),
  512,
  2048,
  RSA.packMessage(salt, data),
  RSA.packMessageAndPad(salt, data)
);
//Common.writeFile("../../circuits/ZkpKycDigSig/input.json", JSON.stringify(b.getFormattedDataForKzpCircuit(), null, 2));
const c = b.getFormattedDataForKzpCircuit();
