import Static from "@utils/static";
import {
  Uint8ArrayToCharArray,
  Uint8ArrayToString,
  bufferToString,
  bufferToUint8Array,
  bytesToString,
  toCircomBigIntBytes,
} from "@zk-email/helpers";
import { sha256Pad } from "@zk-email/helpers";
import logger from "@logger";
import fs from "fs";
import crypto, { sign } from "crypto";
import forge, { asn1, Base64, pkcs7 } from "node-forge";
import Common from "@utils/common";

export default class pkiHandler extends Static {
  constructor() {
    super();
  }

  private static convertPemPublicKeyToPublicKeyObject(pemPublicKey: forge.pki.PublicKey): forge.pki.rsa.PublicKey {
    const publicKeyPem: forge.pki.PEM = forge.pki.publicKeyToPem(pemPublicKey);
    return forge.pki.publicKeyFromPem(publicKeyPem.toString());
  }

  public static getPubKeyModulusFromPemCertificate(pemFormatCertificateString: string): string {
    try {
      const cert: forge.pki.Certificate = forge.pki.certificateFromPem(pemFormatCertificateString);

      const publicKey: forge.pki.rsa.PublicKey = this.convertPemPublicKeyToPublicKeyObject(cert.publicKey);

      return publicKey.n.toString();
    } catch (err) {
      logger.error("Error extracting public key from PEM certificate:", err);
      return "";
    }
  }

  public static getPubKeyModulusFromDerCertificate(derFormatCertificateBinaryString: Buffer): string {
    try {
      const derBytes: forge.util.ByteBuffer = forge.util.createBuffer(derFormatCertificateBinaryString);
      const asn1Object: forge.asn1.Asn1 = forge.asn1.fromDer(derBytes);
      const cert: forge.pki.Certificate = forge.pki.certificateFromAsn1(asn1Object);

      const publicKey: forge.pki.rsa.PublicKey = this.convertPemPublicKeyToPublicKeyObject(cert.publicKey);

      return publicKey.n.toString();
    } catch (err) {
      logger.error("Error extracting public key from DER certificate:", err);
      return "";
    }
  }

  public static getSignedFileData(
    derFormatFileBinaryString: string,
    maxSignAttributesLength: number,
    publicKeyOptional: BigInt = BigInt(0)
  ): SignedFileData | null {
    try {
      const asn1Object: forge.asn1.Asn1 = forge.asn1.fromDer(derFormatFileBinaryString);
      const pkcs7message: forge.pkcs7.Captured<forge.pkcs7.PkcsEnvelopedData | forge.pkcs7.PkcsSignedData> =
        forge.pkcs7.messageFromAsn1(asn1Object);

      //CONTENT
      var contentData: string = pkcs7message.rawCapture.content.value[0].value.toString();
      //console.log("contentData: ", Buffer.from(contentData, "ascii").toString("hex"));

      //SIGNATURE
      const signatureBinaryString: string = pkcs7message.rawCapture.signature;
      const signatureBigInt: BigInt = BigInt("0x" + Buffer.from(signatureBinaryString, "binary").toString("hex"));
      const signatureCircomBigIntBytes: string[] = toCircomBigIntBytes(signatureBigInt);

      //SIGNED ATTRIBUTES AND SIGNED ATTRUIBUTES LENGTH
      const signedAttributesBinaryData: string = pkcs7message.rawCapture.authenticatedAttributes;
      //console.log("signedAttributesBinaryData: ", JSON.stringify(signedAttributesBinaryData, null, 2));
      const signedAttributesAsn1Format: asn1.Asn1 = forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.SET,
        true,
        signedAttributesBinaryData
      );
      printValues(signedAttributesAsn1Format);
      //console.log(JSON.stringify(signedAttributesAsn1Format));
      const signedAttributesBuffer: Buffer = Buffer.from(asn1.toDer(signedAttributesAsn1Format).data, "binary"); //important that it is from binary
      const [signedAttributesPadded, signedAttributesPaddedLength] = sha256Pad(
        signedAttributesBuffer,
        maxSignAttributesLength
      );
      const signedAttributesPaddedCharArray: string[] = Uint8ArrayToCharArray(signedAttributesPadded);
      const signedAttributesPaddedLengthString: string = signedAttributesPaddedLength.toString();

      //Compute the hash of the signed attributes to them
      /*let hasher = crypto.createHash("SHA256");
      hasher.update(signedAttributesBuffer);
      const hash = hasher.digest("hex");
      console.log("hash: ", hash);*/

      ///////////////////////////// TO REMOVE
      // Assume 'publicKeyOptional' is your modulus as BigInt
      const n = new forge.jsbn.BigInteger(publicKeyOptional.toString(16), 16);
      // Public exponent (usually 65537)
      const e = new forge.jsbn.BigInteger("10001", 16);
      // Convert the signature string to a Forge BigInteger
      const signatureBigIntXX = new forge.jsbn.BigInteger(
        Buffer.from(signatureBinaryString, "binary").toString("hex"),
        16
      );
      // Decrypt the signature
      const decryptedSignature = signatureBigIntXX.modPow(e, n);
      // Convert decrypted signature to a hexadecimal string
      const decryptedHex = decryptedSignature.toString(16);
      //console.log(signedAttributes.toString());
      //console.log("Decrypted signature:", decryptedHex);
      /////////////////////////////

      //PUBLIC KEY TODO
      // Convert the certificates string to a binary buffer
      const certificatesBinaryString = pkcs7message.rawCapture.certificates;
      //const certificatesBinaryBuffer = Buffer.from(certificatesBinaryString, "binary");

      //console.log("asd: ", JSON.stringify(asd, null, 2));
      // Parse the ASN.1 structure from the binary buffer
      //const certificatesAsn1Format = forge.asn1.fromDer(certificatesBinaryBuffer.toString("binary"));

      // Assuming the certificates are in a SEQUENCE
      //const certificates = certificatesAsn1Format.value[0];
      //console.log("certificates: ", JSON.stringify(certificates, null, 2));
      /*console.log("certificatesAsn1Format: ", JSON.stringify(certificatesAsn1Format, null, 2));
      const certificateValue = certificatesAsn1Format.value[0];
      console.log("certificateValue: ", JSON.stringify(certificateValue, null, 2));*/

      let publicKey: BigInt = BigInt(0);
      if (publicKeyOptional !== BigInt(0)) {
        publicKey = publicKeyOptional;
      }
      const publicKeyCircomBigIntBytes: string[] = toCircomBigIntBytes(publicKey);

      var signedFileData: SignedFileData = {
        signature: signatureCircomBigIntBytes,
        publicKey: publicKeyCircomBigIntBytes,
        signAttrs: signedAttributesPaddedCharArray,
        signAttrsLength: signedAttributesPaddedLengthString,
      };
      return signedFileData;
    } catch (error) {
      console.error(`Error reading or parsing the .p7m file: ${error}`);
      return null;
    }
  }
}

function printValues(obj: any, path = "") {
  if (typeof obj !== "object" || obj === null) {
    return;
  }

  if (Array.isArray(obj)) {
    // If obj is an array, iterate over its elements
    for (let i = 0; i < obj.length; i++) {
      const currentPath = `${path}[${i}]`;
      printValues(obj[i], currentPath);
    }
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === "value" && typeof obj[key] === "string") {
          // Convert binary formatted string to normal string
          const normalString = Buffer.from(obj[key], "binary").toString("hex");
          console.log(`\nPath: ${currentPath}`);
          console.log(`Converted value: ${normalString}`);
          console.log(`Original value: ${obj[key].toString()}`);
          console.log(
            `from type ${obj.type}, tagClass ${obj.tagClass}, constructed ${obj.constructed}, composed ${obj.composed}\n`
          );
        } else if (key === "value" && Array.isArray(obj[key])) {
          // If the "value" key is an array, iterate over it
          for (let i = 0; i < obj[key].length; i++) {
            const arrayElement = obj[key][i];
            const arrayPath = `${currentPath}[${i}]`;
            printValues(arrayElement, arrayPath);
          }
        } else if (typeof obj[key] === "object") {
          printValues(obj[key], currentPath);
        }
      }
    }
  }
}

interface SignedFileData {
  signature: string[];
  publicKey: string[];
  signAttrs: string[];
  signAttrsLength: string;
}
