import e, { Router, Request, Response } from "express";
import logger from "@logger";
import * as forge from "node-forge"; //TODO remove * as
import path from "path";
import fs from "fs";
import * as circomlibjs from "circomlibjs"; //TODO remove * as
import * as crypto from "crypto";
import {
  toCircomBigIntBytes,
  bigIntToChunkedBytes,
  bytesToBigInt,
  bufferToUint8Array,
  Uint8ArrayToCharArray,
  sha256Pad,
  CIRCOM_BIGINT_N,
  CIRCOM_BIGINT_K,
} from "@zk-email/helpers"; // assuming helper functions are imported

const router = Router();

router.get("/hash", async (req: Request, res: Response) => {
  // Convert each character into its ASCII value (field elements)
  const fiscalCode = "ABCDE12345";
  const fieldElements = fiscalCode.split("").map((char) => char.charCodeAt(0));

  // Compute Poseidon hash of the field elements
  const poseidon = await circomlibjs.buildPoseidon(); // Initialize Poseidon hasher
  const F = poseidon.F; // Finite field operations

  const hash = poseidon(fieldElements);

  // Correctly convert the hash field element to a string
  const hashString = F.toString(hash); // Use the finite field's toString method

  // Return the fiscal code and the hash in the required format
  res.json({ fiscal_code: fieldElements, expected_hash: hashString });
});

function bigint_to_array(n: number, k: number, x: bigint) {
  let mod: bigint = 1n; //1n = value of biginteger 1
  for (var idx = 0; idx < n; idx++) {
    mod = mod * 2n;
  }

  let ret: bigint[] = [];
  var x_temp: bigint = x;
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % mod);
    x_temp = x_temp / mod;
  }
  return ret;
}
// Function to perform deterministic PKCS#1 v1.5 padding
//k = byte length of RSA modulus
function pkcs1_v1_5_pad_deterministic(message: Buffer, k: number): Buffer {
  const mLen = message.length;
  if (mLen > k - 11) {
    throw new Error("Message too long");
  }
  const psLen = k - mLen - 3;
  const ps = Buffer.alloc(psLen, 0x01); // Use 0x01 for padding
  const em = Buffer.concat([Buffer.from([0x00, 0x02]), ps, Buffer.from([0x00]), message]);
  return em;
}

function encryptWithoutPadding(publicKey: any, message: string): bigint {
  // Convert the message to a BigInt directly
  const messageBigInt = BigInt("0x" + Buffer.from(message, "utf8").toString("hex"));

  // Perform RSA encryption: ciphertext = (message^e) % n
  const cipherTextBigInt = messageBigInt ** BigInt(publicKey.e.toString()) % BigInt("0x" + publicKey.n.toString(16));

  return cipherTextBigInt;
}

// RSA encryption function
function encrypt(publicKey: any, message: string): bigint {
  // Convert the message to a Buffer
  const messageBuffer = Buffer.from(message, "utf8");

  // Determine modulus size in bytes
  const modulusBitLength = publicKey.n.bitLength();
  const modulusByteLength = Math.ceil(modulusBitLength / 8);

  // Perform PKCS#1 v1.5 padding
  const paddedMessage = pkcs1_v1_5_pad_deterministic(messageBuffer, modulusByteLength);

  // Convert the padded message to BigInt
  const paddedMessageBigInt = BigInt("0x" + paddedMessage.toString("hex"));

  // Perform RSA encryption: ciphertext = (paddedMessage^e) % n
  const cipherTextBigInt =
    paddedMessageBigInt ** BigInt(publicKey.e.toString()) % BigInt("0x" + publicKey.n.toString(16));

  return cipherTextBigInt;
}

router.get("/rsa", async (req, res) => {
  try {
    // RSA public key in PEM format
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43dLo7r/6VzEwXX+isFX
b5FZvfxSNr+t2ocdpdAvMvx6M6J5CXSkf5nIsXh6C2io17Os5G3GgMYyP8zq81YJ
Cn3IXst4zfxSEwEodPt+BPSahUaP4xPpwMQb+93kKWqN/v+EEI7Zbgbcr11fla+S
fLeqwtKjmXxAU/oeDRSxmu+OO31V2hA8NoJBvQGz5ZvTgbWURupDei18GZA4vSWj
xLCEZYXCE3vSEcxtFsIZPWBHHr19z5R6AYzpOktIhYK6Bgp5ermTIoHby3rfbzbx
zTdF2TJIkJAM1YLgBBLVXjmuDj6H4UjMys/PyDa813Hz7oGrVAl7oIU36uRLqkfO
xwIDAQAB
-----END PUBLIC KEY-----`;
    // Load the public key using node-forge
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Fiscal code and conversion to Buffer
    const fiscalCode = `{"salt":"L0ngR4nd0mS4ltSup3rS3cur3!","data":"GRDNNA66L65B034A"}`;
    const cipherText = encrypt(publicKey, fiscalCode);
    const messageBuffer = Buffer.from(fiscalCode, "utf8");

    // Determine modulus size in bytes
    const modulusBitLength = publicKey.n.bitLength();
    const modulusByteLength = Math.ceil(modulusBitLength / 8);

    // Perform PKCS#1 v1.5 padding
    const paddedMessage = pkcs1_v1_5_pad_deterministic(messageBuffer, modulusByteLength);

    // Convert the padded message to BigInt
    const paddedMessageBigInt = BigInt("0x" + paddedMessage.toString("hex"));
    // Parameters
    const w = 121; // Word size
    const nb = 17; // Number of limbs (64 limbs for a 2048-bit modulus)

    /*// Prepare the inputs for the circuit
    const inputs = {
      fiscal_code: bigint_to_array(w, nb, BigInt("0x" + Buffer.from(fiscalCode, "utf8").toString("hex"))), // Fiscal code
      cipher_text: bigint_to_array(w, nb, BigInt("0x" + Buffer.from(cipherText, "utf8").toString("hex"))), // Encrypted fiscal code
      public_key: bigint_to_array(w, nb, BigInt("0x" + publicKey.n.toString(16))), // RSA modulus
      exp: bigint_to_array(w, nb, BigInt(publicKey.e.toString())), // RSA public exponent
    };*/

    // Prepare the inputs for the circuit
    const inputs = {
      asd: toCircomBigIntBytes(paddedMessageBigInt),
      fiscal_code: bigint_to_array(w, nb, paddedMessageBigInt).map((b) => b.toString()), // Fiscal code
      cipher_text: bigint_to_array(w, nb, cipherText).map((b) => b.toString()), // Encrypted fiscal code
      public_key: bigint_to_array(w, nb, BigInt("0x" + publicKey.n.toString(16))).map((b) => b.toString()), // RSA modulus
      exp: bigint_to_array(w, nb, BigInt(publicKey.e.toString())).map((b) => b.toString()), // RSA public exponent
    };

    // Send the input JSON
    res.json(inputs);
  } catch (error) {
    console.error("Error generating inputs:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/hash256", async (req: Request, res: Response) => {
  // Define the fiscal code string
  const fiscalCode = "ABCDE12345";

  // Convert the fiscal code string to a buffer using ASCII encoding
  const fiscalCodeBuffer = Buffer.from(fiscalCode, "ascii");

  // Convert the fiscal code buffer to an array of bits
  const fiscalCodeBits: number[] = [];
  for (let i = 0; i < fiscalCodeBuffer.length; i++) {
    const byte = fiscalCodeBuffer[i];
    for (let j = 7; j >= 0; j--) {
      fiscalCodeBits.push((byte >> j) & 1);
    }
  }

  // Compute the SHA256 hash of the fiscal code buffer
  const hashBuffer = crypto.createHash("sha256").update(fiscalCodeBuffer).digest();

  // Convert the hash buffer to an array of bits
  const expectedHash: number[] = [];
  for (let i = 0; i < hashBuffer.length; i++) {
    const byte = hashBuffer[i];
    for (let j = 7; j >= 0; j--) {
      expectedHash.push((byte >> j) & 1);
    }
  }

  // Return the JSON object with fiscal_code_bits and expected_hash
  res.json({
    fiscal_code_bits: fiscalCodeBits,
    expected_hash: expectedHash,
  });
});

export default router;
