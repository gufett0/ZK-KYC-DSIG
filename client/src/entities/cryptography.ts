// Function to import a PEM-encoded public key
export default class Cryptography {
  /**
   * Imports a PEM-encoded public key.
   * @param pem The PEM-encoded public key.
   * @returns A Promise that resolves to a CryptoKey.
   */
  public static async importPublicKey(pem: string): Promise<CryptoKey> {
    const temp = this.extractPemContent(pem);
    console.log(temp);
    const binaryDerString = window.atob(temp);
    console.log(binaryDerString);
    const binaryDer = this.str2ab(binaryDerString);
    console.log(binaryDer);
    const temp2 = await window.crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
    console.log(temp2);
    return temp2;
  }

  /**
   * Imports a PEM-encoded private key.
   * @param pem The PEM-encoded private key.
   * @returns A Promise that resolves to a CryptoKey.
   */
  public static async importPrivateKey(pem: string): Promise<CryptoKey> {
    const temp = this.extractPemContent(pem);
    console.log("temp: " + temp);
    const binaryDerString = window.atob(temp);
    console.log("binaryDerString: " + binaryDerString);
    const binaryDer = this.str2ab(binaryDerString);
    console.log("binaryDer: " + binaryDer);
    const temp2 = await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
    console.log("temp2: " + temp2);
    return temp2;
  }

  /**
   * Extracts the base64-encoded content from a PEM string.
   * @param pem The PEM string.
   * @returns The base64-encoded content.
   */
  private static extractPemContent(pem: string): string {
    return pem.replace(/-----BEGIN [A-Z ]+-----|-----END [A-Z ]+-----|\n|\r|\s+/g, "");
  }

  /**
   * Converts a string to an ArrayBuffer.
   * @param str The string to convert.
   * @returns The ArrayBuffer.
   */
  private static str2ab(str: string): ArrayBuffer {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Encrypts data using the public key.
   * @param publicKey The public key.
   * @param data The data to encrypt.
   * @returns A Promise that resolves to the encrypted data in Base64 format.
   */
  public static async encryptData(publicKey: CryptoKey, data: string): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encodedData
    );
    return window.btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Decrypts data using the private key.
   * @param privateKey The private key.
   * @param encryptedData The encrypted data in Base64 format.
   * @returns A Promise that resolves to the decrypted data.
   */
  public static async decryptData(privateKey: CryptoKey, encryptedData: string): Promise<string> {
    const encryptedBytes = this.str2ab(window.atob(encryptedData));
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedBytes
    );
    return new TextDecoder().decode(decrypted);
  }
}
