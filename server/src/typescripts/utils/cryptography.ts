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

  /**
   * Generates an X.509 certificate containing the public key of an entity.
   * @param {string} commonName - The common name (CN) for the certificate subject.
   * @param {forge.pki.PrivateKey} privateKey - The private key to sign the certificate.
   * @param {forge.pki.PublicKey} publicKey - The public key to include in the certificate.
   * @param {number} validDays - The number of days the certificate will be valid for.
   * @param {string[]} altNameIPs - Optional IPs for Subject Alternative Names (SANs).
   * @param {string[]} altNameURIs - Optional URIs for Subject Alternative Names (SANs).
   * @returns {forge.pki.Certificate} - The generated X.509 certificate in PEM format.
   */
  public static createX509Certificate(
    commonName: string,
    privateKey: forge.pki.PrivateKey,
    publicKey: forge.pki.PublicKey,
    validDays: number,
    altNameIPs?: string[],
    altNameURIs?: string[]
  ): forge.pki.Certificate {
    // Create a new certificate
    const cert = forge.pki.createCertificate();

    // Set the public key for the certificate
    cert.publicKey = publicKey;

    // Set the certificate's subject attributes
    cert.setSubject([
      {
        name: "commonName",
        value: commonName,
      },
    ]);

    // Set the certificate's issuer attributes (self-signed, same as subject)
    cert.setIssuer([
      {
        name: "commonName",
        value: commonName,
      },
    ]);

    // Set the certificate's serial number (valid as per ASN.1 INTEGER)
    cert.serialNumber = "01" + crypto.randomBytes(19).toString("hex"); // 1 octet = 8 bits = 1 byte = 2 hex chars

    // Set the certificate's validity period
    const now = new Date();
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

    // Add Subject Alternative Names (SANs) if provided
    const altNames = [];
    if (altNameURIs) {
      altNames.push(...altNameURIs.map((uri) => ({ type: 6, value: uri }))); // 6 is for URI
    }
    if (altNameIPs) {
      altNames.push(...altNameIPs.map((ip) => ({ type: 7, ip }))); // 7 is for IP address
    }

    if (altNames.length > 0) {
      cert.setExtensions([
        {
          name: "subjectAltName",
          altNames,
        },
      ]);
    }

    // Self-sign the certificate using the provided private key
    cert.sign(privateKey, forge.md.sha256.create());
    logger.info("Certificate created");

    // Return the generated certificate
    return cert;
  }

  /**
   * Converts the generated certificate to PEM format.
   * @param {forge.pki.Certificate} certificate - The certificate to convert.
   * @returns {string} - The certificate in PEM format.
   */
  public static certificateToPem(certificate: forge.pki.Certificate): string {
    return forge.pki.certificateToPem(certificate);
  }

  /**
   * Converts the certificate to DER format (binary form).
   * @param {forge.pki.Certificate} certificate - The certificate to convert.
   * @returns {Uint8Array} - The certificate in DER format.
   */
  public static certificateToDer(certificate: forge.pki.Certificate): Uint8Array {
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
    return new Uint8Array(der.split("").map((char) => char.charCodeAt(0)));
  }
}
