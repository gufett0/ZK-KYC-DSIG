import { generateKeyPairSync, publicEncrypt, privateDecrypt, createSign, sign, verify } from "crypto";
import { writeFileSync, readFileSync } from "fs";
import * as forge from "node-forge";

/**
 * Generate a public and private key pair.
 * Using ECDSA with the secp256k1 curve.
 */
function generateECDSAKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    publicKeyEncoding: {
      type: "spki", // Public Key in X.509/SPKI format
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8", // Private Key in PKCS#8 format
      format: "pem",
    },
  });
  //cannot encrypt and decrypt with these keys
  return { publicKey, privateKey };
}

/**
 * Generate an RSA public and private key pair.
 * @returns An object containing the public key and private key in PEM format.
 */
function generateRSAKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048, // Size of the key in bits
    publicKeyEncoding: {
      type: "spki", // Public Key in X.509/SPKI format
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8", // Private Key in PKCS#8 format
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}

/**
 * Encrypt (cipher) the fiscal code with the public key.
 * @param publicKey The public key to encrypt with.
 * @param fiscalCode The fiscal code to encrypt.
 */
function cipherFiscalCode(publicKey: string, fiscalCode: string): string {
  const buffer = Buffer.from(fiscalCode, "utf-8");
  const encrypted = publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64"); // Return the encrypted data in base64 format
}

/**
 * Decrypt (decipher) the encrypted fiscal code with the private key.
 * @param privateKey The private key to decrypt with.
 * @param encryptedFiscalCode The encrypted fiscal code (in base64 format).
 */
function decipherFiscalCode(privateKey: string, encryptedFiscalCode: string): string {
  const encryptedBuffer = Buffer.from(encryptedFiscalCode, "base64");
  const decrypted = privateDecrypt(privateKey, encryptedBuffer);
  return decrypted.toString("utf-8"); // Return the decrypted fiscal code as a string
}

/**
 * Converts a string to a DER-encoded OctetString and encodes it in Base64.
 * @param input The string to be converted.
 * @returns A Base64-encoded string containing the DER-encoded data.
 */
function stringToBase64Der(input: string): string {
  // Create a forge Asn1 object from the input string
  const asn1 = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL, // Tag Class
    forge.asn1.Type.OCTETSTRING, // ASN.1 Type
    false, // IsConstructed
    input // Value
  );

  // Encode the Asn1 object to DER format
  const derBytes = forge.asn1.toDer(asn1).getBytes();

  // Convert the DER bytes to a Base64 string
  const base64Der = forge.util.encode64(derBytes); // Encode bytes directly to Base64

  return base64Der;
}

// Function to sign a document using ECDSA
function signDocument(privateKey: string, document: string): string {
  const sign = createSign("SHA256");
  sign.update(document);
  sign.end();
  return sign.sign(privateKey, "base64"); // Return signature in base64 format
}

// Generate key pair (from earlier code)
const { publicKey: publicKeyRSA, privateKey: privateKeyRSA } = generateRSAKeyPair();
console.log("Public Key:", publicKeyRSA);
console.log("Private Key:", privateKeyRSA);
// Fiscal code to encrypt
const fiscalCode = "ABCDEF12345";
// Encrypt the fiscal code
const encryptedFiscalCode = cipherFiscalCode(publicKeyRSA, fiscalCode);
console.log("Encrypted Fiscal Code:", encryptedFiscalCode);
// Decrypt the fiscal code
const decryptedFiscalCode = decipherFiscalCode(privateKeyRSA, encryptedFiscalCode);
console.log("Decrypted Fiscal Code:", decryptedFiscalCode); // Should output "ABCDEF12345"

// Create the document to sign
const documentToSign = JSON.stringify({
  data: encryptedFiscalCode, // Include the encrypted fiscal code
  date: new Date().toISOString(), // Include timestamp
});

// Generate ECDSA key pair
const { publicKey: publicKeyECDSAs, privateKey: privateKeyECDSAs } = generateECDSAKeyPair();
const privateKeyECDSA = forge.pki.privateKeyFromPem(privateKeyECDSAs);
console.log(privateKeyECDSA);
// Create a self-signed certificate using node-forge
const cert = forge.pki.createCertificate();
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
cert.setSubject([{ name: "commonName", value: "Your Name" }]);
cert.setIssuer(cert.subject.attributes);
// Create the document
const md = forge.md.sha256.create();
md.update(documentToSign, "utf8");
// Sign the document using ECDSA
const signature = privateKeyECDSA.sign(documentToSign);
// Package the document and signature
const signedDocument = {
  document: documentToSign,
  signature: stringToBase64Der(signature), // DER format for the signature
  certificate: forge.pki.certificateToPem(cert),
};
// Save to disk
writeFileSync("./signed_document_with_cert.pem", forge.pki.certificateToPem(cert));
writeFileSync("./signed_document.json", JSON.stringify(signedDocument, null, 2));

console.log("Document signed and saved with certificate.");

//Verify
const loadedSignedDocument = JSON.parse(readFileSync("./signed_document.json", "utf8"));
const loadedCertPem = readFileSync("./signed_document_with_cert.pem", "utf8");

// Load the certificate and extract the public key
const loadedCert = forge.pki.certificateFromPem(loadedCertPem);
const publicKeyECDSA = forge.pki.publicKeyToRSAPublicKey(loadedCert.publicKey);

// Re-hash the document
const mdToVerify = forge.md.sha256.create();
mdToVerify.update(loadedSignedDocument.document, "utf8");

// Decode the signature from Base64
const signatureToVerify = forge.util.decode64(loadedSignedDocument.signature);

// Verify the signature using the public key
const isVerified = publicKeyECDSA.verify(mdToVerify.digest().bytes(), signatureToVerify);

console.log("Signature verified:", isVerified);
