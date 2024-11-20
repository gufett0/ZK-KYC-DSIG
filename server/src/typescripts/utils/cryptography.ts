import * as forge from "node-forge";
import * as crypto from "crypto";
import logger from "@logger";
import fs from "fs";

export default class Cryptography {
  /**
   * Generate an RSA public and private key pair.
   * @returns An object containing the public key and private key in PEM format.
   */
  public static generateRSAKeyPair() {
    // Generate the RSA key pair with specified options
    const keyPair = forge.pki.rsa.generateKeyPair({
      bits: 2048, // Size of the key in bits
      e: 0x10001, // Public exponent
    });

    // Convert the keys to PEM format for easier handling
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    //We'll convert the private key to the PKCS#8 format, which is more widely supported.
    //It is a standard format for storing private keys, and it includes metadata about the key.
    const privateKeyAsn1 = forge.pki.privateKeyToAsn1(keyPair.privateKey);

    // Convert the ASN.1 private key to PKCS#8
    const privateKeyPkcs8Asn1 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);

    // Convert the PKCS#8 ASN.1 private key to PEM format
    const privateKeyPkcs8Pem = forge.pki.privateKeyInfoToPem(privateKeyPkcs8Asn1);

    // Return the keys in an object
    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPkcs8Pem,
    };
  }

  /**
   * Write the RSA key pair to disk.
   * @param publicKeyPath The file path to write the public key.
   * @param privateKeyPath The file path to write the private key.
   */
  public static writeKeyPairToDisk(publicKeyPath: string, privateKeyPath: string) {
    const { publicKey, privateKey } = this.generateRSAKeyPair();

    try {
      // Write the public key to disk
      fs.writeFileSync(publicKeyPath, publicKey, "utf8");
      logger.info(`Public key written to ${publicKeyPath}`);

      // Write the private key to disk
      fs.writeFileSync(privateKeyPath, privateKey, "utf8");
      logger.info(`Private key written to ${privateKeyPath}`);
    } catch (error) {
      logger.error("Error writing keys to disk:", error);
    }
  }

  /**
   * Encrypt a string using the provided public key.
   * @param publicKey The public key to encrypt with.
   * @param data The string data to encrypt.
   * @returns Encrypted data in base64 format.
   */
  public static encryptString(publicKey: string, data: string): string {
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
  public static decryptString(privateKey: string, encryptedData: string): string {
    const encryptedBuffer = Buffer.from(encryptedData, "base64");
    const decrypted = crypto.privateDecrypt(privateKey, encryptedBuffer);
    return decrypted.toString("utf-8"); // Return decrypted data as a string
  }
}
