import Static from "./static";
import crypto from "crypto";
import Common from "./common";
import forge from "node-forge";

export default class RSA extends Static {
  constructor() {
    super();
  }

  public static encrypt(pubkey: string, buffer: Buffer): string {
    const encrypted = crypto.publicEncrypt(
      {
        key: pubkey,
        padding: crypto.constants.RSA_NO_PADDING,
      },
      buffer
    );
    return encrypted.toString("base64");
  }

  public static decrypt(privkey: string, encryptedMessage: string): string {
    const buffer = Buffer.from(encryptedMessage, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privkey,
        padding: crypto.constants.RSA_NO_PADDING,
      },
      buffer
    );
    return decrypted.toString("utf8");
  }
  public static packMessage(salt: string, message: string): string {
    return JSON.stringify({ salt: salt, data: message });
  }
  /*
  public static packMessageAndPad(salt: string, message: string): Buffer {
    let buffer = Buffer.from(RSA.packMessage(salt, message), "ascii");
    if (buffer.length < 256) {
      // Left-pad with zeros
      const pad = Buffer.alloc(256 - buffer.length, 0);
      buffer = Buffer.concat([pad, buffer]);
    }
    if (buffer.length > 256) {
      throw new Error("Message is longer than 256.");
    }
    return buffer;
  }*/
  public static packMessageAndPad(salt: string, message: string): Buffer {
    const raw = RSA.packMessage(salt, message);
    const messageBuffer = Buffer.from(raw, "ascii");

    const k = 256;
    const mLen = messageBuffer.length;

    //For deterministic PKCS#1 v1.5 padding, we need at least 11 bytes overhead:
    //0x00 | 0x02 | PS...PS | 0x00 | message
    if (mLen > k - 11) {
      throw new Error("Message too long to fit into 2048-bit RSA block with deterministic PKCS#1 v1.5 padding.");
    }
    //Build the “PS” (padding) region. For deterministic style: fill with 0x01
    const psLen = k - mLen - 3;
    const ps = Buffer.alloc(psLen, 0x01);

    //Build the final padded buffer:
    //0x00 0x02 [psLen bytes of 0x01] 0x00 [the message]
    const em = Buffer.concat([Buffer.from([0x00, 0x02]), ps, Buffer.from([0x00]), messageBuffer]);

    return em;
  }

  public static rsaRawEncrypt(message: Buffer, pubKeyPem: string): string {
    const publicKey = forge.pki.publicKeyFromPem(pubKeyPem) as forge.pki.rsa.PublicKey;

    const e = BigInt(publicKey.e.toString());
    const n = BigInt("0x" + publicKey.n.toString(16));

    const m = BigInt("0x" + message.toString("hex"));

    //c = m^e mod n
    const c: BigInt = m ** e % n;

    return Buffer.from(c.toString(16), "hex").toString("base64");
  }

  /*public static rsaRawEncrypt(message: Buffer, pubKeyPem: string): string {
    // parse the public key from PEM
    const publicKey = forge.pki.publicKeyFromPem(pubKeyPem) as forge.pki.rsa.PublicKey;

    // Convert the message to a BigInteger
    const m = new forge.jsbn.BigInteger(message.toString("hex"), 16);

    // Convert exponent and modulus to BigIntegers
    const e = new forge.jsbn.BigInteger(publicKey.e.toString(16), 16);
    const n = new forge.jsbn.BigInteger(publicKey.n.toString(16), 16);

    // c = m^e mod n
    const c = m.modPow(e, n);

    // Convert back to bytes.  Might need left-padding to 256 bytes
    let out = Buffer.from(c.toByteArray());

    // If it’s shorter than 256, left-pad with 0x00
    if (out.length < 256) {
      const pad = Buffer.alloc(256 - out.length, 0);
      out = Buffer.concat([pad, out]);
    }
    return Buffer.from(out.toString("hex"), "hex").toString("base64");
  }*/
}

/*const data = "GRDNNA66L65B034A";
const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";

const buffer = RSA.packMessageAndPad(salt, data);

const pubKeyPem = Common.readFileToUTF8String("../../files/JudgePublicKey.pem");
const privKeyPem = Common.readFileToUTF8String("../../files/JudgePrivateKey.pem");

const cipher = RSA.encrypt(pubKeyPem, buffer);
const plain = RSA.decrypt(privKeyPem, cipher);

console.log("padded:", JSON.stringify(buffer));
console.log("cipher:", JSON.stringify(cipher));
console.log("plain:", JSON.stringify(plain));

const cipher2 = RSA.rsaRawEncrypt(buffer, pubKeyPem);
console.log("cipher2:", JSON.stringify(cipher2));*/
