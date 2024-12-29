import Static from "./static";
import crypto from "crypto";
import Common from "./common";

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
}
/*
const data = "GRDNNA66L65B034A";
const salt = "L0ngR4nd0mS4ltSup3rS3cur3!";

const padded = RSA.packAndPadMessagge(salt, data);
const pubKeyPem = Common.readFileToUTF8String("../../files/JudgePublicKey.pem");
const privKeyPem = Common.readFileToUTF8String("../../files/JudgePrivateKey.pem");

const cipher = RSA.encrypt(pubKeyPem, RSA.packAndPadMessagge(salt, data));
const plain = RSA.decrypt(privKeyPem, cipher);

console.log("padded:", padded);
console.log("cipher:", cipher);
console.log("plain:", plain);*/
