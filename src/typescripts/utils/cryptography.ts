import * as forge from "node-forge";
import * as crypto from "crypto";

/**
 * Generate an RSA public and private key pair.
 * @returns An object containing the public key and private key in PEM format.
 */
function generateRSAKeyPair() {
  // Generate the RSA key pair with specified options
  const keyPair = forge.pki.rsa.generateKeyPair({
    bits: 2048, // Size of the key in bits
    e: 0x10001, // Public exponent
  });

  // Convert the keys to PEM format for easier handling
  const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

  // Return the keys in an object
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
  };
}

/**
 * Encrypt a string using the provided public key.
 * @param publicKey The public key to encrypt with.
 * @param data The string data to encrypt.
 * @returns Encrypted data in base64 format.
 */
function encryptString(publicKey: string, data: string): string {
  const buffer = Buffer.from(data, "utf-8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64"); // Return encrypted data in base64
}

/**
 * Decrypt a string using the provided private key.
 * @param privateKey The private key to decrypt with.
 * @param encryptedData The encrypted string (in base64 format).
 * @returns Decrypted string data.
 */
function decryptString(privateKey: string, encryptedData: string): string {
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, encryptedBuffer);
  return decrypted.toString("utf-8"); // Return decrypted data as a string
}
