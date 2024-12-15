import * as asn1Lib from "asn1js";
import * as pkiLib from "pkijs";
import common from "@utils/common";
export interface Pkcs7Data {
  PublicKeyModulus: BigInt;
  CaPublicKeyModulus: BigInt;
  Signature: BigInt;
  SignedAttributes: Buffer;
  Content: Buffer;
  MessageDigest: Buffer;
  CertificateTbs: Buffer;
  CertificateSignature: BigInt;
  Exponent: BigInt;
  JudgePublicKeyModulus: BigInt;
}

export default class Pkcs7Handler {
  private SignedFileBinaryBuffer!: Buffer;
  private CaCertBuffer!: Buffer;
  private FileAsn1Format!: asn1Lib.AsnType;
  private ContentInfo!: pkiLib.ContentInfo;
  private SignedData!: pkiLib.SignedData;
  private Certificates!: pkiLib.Certificate[];
  private EncapContentInfo!: pkiLib.EncapsulatedContentInfo;
  private SignerInfos!: pkiLib.SignerInfo[];
  private Signatures!: asn1Lib.OctetString[];
  private SignedAttributes!: pkiLib.SignedAndUnsignedAttributes[];
  private JudgePublicKeyPem!: string;
  //Prepared data:
  private PublicKeyModulus!: BigInt;
  private SignedAttributesBuffer!: Buffer;
  private SignatureHexBigInt!: BigInt;
  private Content!: Buffer;
  private MessageDigestBuffer!: Buffer;
  private CertificateTbsBuffer!: Buffer;
  private CertificateSignatureHexBigInt!: BigInt;
  private CaPublicKeyModulus!: BigInt;
  private RsaExponent!: BigInt;
  private JudgePublicKeyModulus!: BigInt;

  /*
  //1-->SignedAttributes could be null since they are optional but they are very used so we assume they are always present.
  //2-->eContent could be null since they are optional but they are very used so we assume they are always present.
  //3-->Certificates contain the fiscal code in the form of (for example) TINIT-12345678901 where (TIN=Tax Identification Number, IT=Italy). I'll work only for italy but we could easily generalize it.
  //4-->I assume that the CA chain is composed of only 1 entity (the root CA) for simplicity. We could easily generalize it.
  //5-->I assume that the signature is always RSA with SHA256. We could easily generalize it.
  //6-->I assume that the key exponent is always fixed to 65537.
  //7-->I assume that the public keys are always RSA 2048 bits. Circom does not support other key lengths for RSA. We could generalize using another technology.
  */

  constructor(signedFileBinaryBuffer: Buffer, caCertBuffer: Buffer, judgePublicKeyPem: string) {
    if (!signedFileBinaryBuffer || signedFileBinaryBuffer.length === 0) {
      throw new Error("Invalid or empty file buffer provided");
    }
    if (!caCertBuffer || caCertBuffer.length === 0) {
      throw new Error("Invalid or empty CA certificate buffer provided");
    }
    if (!judgePublicKeyPem || judgePublicKeyPem.length === 0) {
      throw new Error("Invalid or empty Judge public key pem string provided");
    }
    this.SignedFileBinaryBuffer = signedFileBinaryBuffer;
    this.CaCertBuffer = caCertBuffer;
    this.JudgePublicKeyPem = judgePublicKeyPem;
    //Function calls
    this.extractFileAsn1Format();
    this.extractContentInfo();
    this.extractSignedData();
    this.extractCertificates();
    this.extractEncapContentInfo();
    this.extractSignerInfos();
    this.extractSignatureAndSignedAttributes();
    //For circuit:
    this.extractPublicKeyModulusBigInt();
    this.extractSignedAttributesBuffer();
    this.extractSignatureHexBigInt();
    this.extractContent();
    this.extractMessageDigestFromSignedAttributes();
    this.extractCertificateTbsBuffer();
    this.extractCertificateSignatureValue();
    this.extractCaPublicKeyModulus();
    this.setRsaExponent();
    this.extractJudgePublicKeyModulus();
  }
  private extractFileAsn1Format() {
    const fileAsn1Format = asn1Lib.fromBER(this.SignedFileBinaryBuffer);
    if (fileAsn1Format.offset === -1) {
      throw new Error("Failed to decode ASN.1 structure");
    }
    this.FileAsn1Format = fileAsn1Format.result;
  }
  private extractContentInfo() {
    this.ContentInfo = new pkiLib.ContentInfo({ schema: this.FileAsn1Format });
    if (!this.ContentInfo) {
      throw new Error("Failed to decode ContentInfo structure");
    }
  }
  private extractSignedData() {
    if (this.ContentInfo.contentType !== "1.2.840.113549.1.7.2") {
      throw new Error("Not a valid SignedData structure");
    }
    this.SignedData = new pkiLib.SignedData({ schema: this.ContentInfo.content });
    if (!this.SignedData) {
      throw new Error("Failed to decode SignedData structure");
    }
  }
  private extractCertificates() {
    this.Certificates = [];
    const certificates: pkiLib.Certificate[] = [];
    if (!this.SignedData.certificates || this.SignedData.certificates.length === 0) {
      throw new Error("Failed to extract certificates from SignedData");
    }

    for (const certificate of this.SignedData.certificates) {
      this.Certificates.push(certificate as pkiLib.Certificate);
    }
  }
  private extractEncapContentInfo() {
    if (!this.SignedData.encapContentInfo) {
      throw new Error("Failed to extract EncapsulatedContentInfo from SignedData");
    }
    this.EncapContentInfo = this.SignedData.encapContentInfo;
  }
  private extractSignerInfos() {
    this.SignerInfos = [];
    if (!this.SignedData.signerInfos || this.SignedData.signerInfos.length === 0) {
      throw new Error("Failed to extract SignerInfos from SignedData");
    }
    for (const signerInfo of this.SignedData.signerInfos) {
      this.SignerInfos.push(new pkiLib.SignerInfo(signerInfo));
    }
  }
  private extractSignatureAndSignedAttributes() {
    this.Signatures = [];
    this.SignedAttributes = [];
    for (const signerInfo of this.SignerInfos) {
      if (!signerInfo.signature) {
        throw new Error(
          "Failed to extract Signature from SignerInfo with index: " + this.SignerInfos.indexOf(signerInfo) + "."
        );
      }
      if (!signerInfo.signedAttrs) {
        throw new Error(
          "Failed to extract SignedAttributes from SignerInfo with index: " + this.SignerInfos.indexOf(signerInfo) + "."
        );
      }
      this.Signatures.push(signerInfo.signature);
      this.SignedAttributes.push(new pkiLib.SignedAndUnsignedAttributes(signerInfo.signedAttrs));
    }
  }
  private extractPublicKeyModulusBigInt() {
    this.PublicKeyModulus = this.extractPublicKeyModulusBigIntFromCertificate(0);
  }
  private extractPublicKeyModulusBigIntFromCertificate(certIndex: number = 0) {
    if (this.Certificates.length <= certIndex) {
      throw new Error("No certificates found in the P7M for certIndex: " + certIndex + ".");
    }
    const publicKeyInfo = this.Certificates[certIndex].subjectPublicKeyInfo;
    const publicKeyASN1 = asn1Lib.fromBER(publicKeyInfo.subjectPublicKey.valueBlock.valueHexView);
    if (publicKeyASN1.offset === -1) {
      throw new Error("Error parsing public key ASN.1");
    }
    const rsaPublicKey = new pkiLib.RSAPublicKey({ schema: publicKeyASN1.result });
    const modulusBuffer = rsaPublicKey.modulus.valueBlock.valueHexView;
    const modulusHex = Buffer.from(modulusBuffer).toString("hex");
    return BigInt("0x" + modulusHex);
  }
  private extractSignedAttributesBuffer() {
    this.SignedAttributesBuffer = this.extractSignedAttributesBufferFromArray();
  }
  private extractSignedAttributesBufferFromArray(signedAttributesIndex: number = 0) {
    if (this.SignedAttributes.length <= signedAttributesIndex) {
      throw new Error("No signed attributes found for signedAttributesIndex: " + signedAttributesIndex + ".");
    }
    const signedAttributesArray = this.SignedAttributes[signedAttributesIndex].attributes;
    const signedAttributesAsn1 = new asn1Lib.Set({
      value: signedAttributesArray.map((attr) => attr.toSchema()),
    });
    const signedAttributesDER = signedAttributesAsn1.toBER(false);
    return Buffer.from(signedAttributesDER);
  }
  private extractSignatureHexBigIntFromArray(signatureIndex: number = 0) {
    if (this.Signatures.length <= signatureIndex) {
      throw new Error("No signature found for signatureIndex: " + signatureIndex + ".");
    }
    const signatureValueHex = this.Signatures[signatureIndex].valueBlock.valueHexView;
    if (signatureValueHex.byteLength === 0) {
      throw new Error("Signature value is empty.");
    }
    const signatureBigInt = BigInt("0x" + Buffer.from(signatureValueHex).toString("hex"));
    return signatureBigInt;
  }
  private extractSignatureHexBigInt() {
    this.SignatureHexBigInt = this.extractSignatureHexBigIntFromArray();
  }
  private extractContent() {
    if (!this.EncapContentInfo.eContent) {
      throw new Error("No eContent found from EncapsulatedContentInfo");
    }
    const contentArrayBuffer = this.EncapContentInfo.eContent.valueBlock.valueHexView;
    this.Content = Buffer.from(Buffer.from(contentArrayBuffer).toString(), "ascii");
  }
  private extractMessageDigestFromSignedAttributesFromArray(signedAttributesIndex: number = 0) {
    let messageDigest: Buffer | null = null;
    this.SignedAttributes[signedAttributesIndex].attributes.forEach((attr) => {
      if (attr.type === "1.2.840.113549.1.9.4") {
        messageDigest = Buffer.from(attr.values[0].valueBlock.valueHexView);
      }
    });
    if (messageDigest === null) {
      throw new Error("No message digest found in signed attributes");
    }
    return messageDigest;
  }
  private extractMessageDigestFromSignedAttributes() {
    this.MessageDigestBuffer = this.extractMessageDigestFromSignedAttributesFromArray();
  }
  private extractCertificateTbsBuffer() {
    this.CertificateTbsBuffer = Buffer.from(this.Certificates[0].tbsView);
  }
  private extractCertificateSignatureValue() {
    this.CertificateSignatureHexBigInt = BigInt(
      "0x" + Buffer.from(this.Certificates[0].signatureValue.valueBlock.valueHexView).toString("hex")
    );
  }
  private extractCaPublicKeyModulus() {
    const caAsn1 = asn1Lib.fromBER(this.CaCertBuffer);
    if (caAsn1.offset === -1) {
      throw new Error("Failed to decode CA certificate ASN.1 structure");
    }

    const caCertificate = new pkiLib.Certificate({ schema: caAsn1.result });
    const caPublicKeyASN1 = asn1Lib.fromBER(
      caCertificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView
    );
    if (caPublicKeyASN1.offset === -1) {
      throw new Error("Error parsing CA public key ASN.1");
    }

    const caRsaPublicKey = new pkiLib.RSAPublicKey({ schema: caPublicKeyASN1.result });
    this.CaPublicKeyModulus = BigInt(
      "0x" + Buffer.from(caRsaPublicKey.modulus.valueBlock.valueHexView).toString("hex")
    );
  }
  private setRsaExponent() {
    this.RsaExponent = 65537n;
  }
  private extractJudgePublicKeyModulus() {
    const pem: string = this.JudgePublicKeyPem.replace(
      /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g,
      ""
    );
    this.JudgePublicKeyModulus = BigInt("0x" + Buffer.from(pem, "base64").toString("hex"));
  }

  public getPkcs7DataForZkpKyc(): Pkcs7Data {
    return {
      PublicKeyModulus: this.PublicKeyModulus,
      CaPublicKeyModulus: this.CaPublicKeyModulus,
      Signature: this.SignatureHexBigInt,
      SignedAttributes: this.SignedAttributesBuffer,
      Content: this.Content,
      MessageDigest: this.MessageDigestBuffer,
      CertificateTbs: this.CertificateTbsBuffer,
      CertificateSignature: this.CertificateSignatureHexBigInt,
      Exponent: this.RsaExponent,
      JudgePublicKeyModulus: this.JudgePublicKeyModulus,
    };
  }
}
