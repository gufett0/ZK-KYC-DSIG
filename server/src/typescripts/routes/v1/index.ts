import e, { Router, Request, Response } from "express";
import Pdf from "@utils/pdf";
import logger from "@logger";
import Cryptography from "@utils/cryptography";
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

router.get("/prova", async (req: Request, res: Response) => {
  /*Pdf.createPdf(JSON.stringify({ fiscalCode: "ABCDE123456" }), "./src/typescripts/temp");
  logger.info("pdf created");
  res.send("pdf created?");*/
  const { publicKey, privateKey } = Cryptography.generateRSAKeyPair();
  Cryptography.writeKeyPairToDisk("./src/typescripts/temp/publicKey", "./src/typescripts/temp/privateKey");
  /*const cert = Cryptography.createX509Certificate(
    "Test User",
    forge.pki.privateKeyFromPem(privateKey),
    forge.pki.publicKeyFromPem(publicKey),
    365
  );
  const certPem = Cryptography.certificateToPem(cert);
  console.log(certPem);
  const sampleText = JSON.stringify({
    name: "Matteo Savino",
    text: "This is a demo PDF with some sample text.",
    fiscalCode: "ABCDE12345",
  });
  const savePath = "./src/typescripts/temp"; // Folder where signed PDF will be saved
  const pdfFileName = "demo_signed_pdf.pdf";
  const pdfBytes = await Pdf.createPdf(sampleText);*/

  res.send(privateKey + "\n\n" + publicKey);
});

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
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwohQEbyVTK9kxZ9kGXv6
GI1LVXd82gsId3FysH4sXd0RUpVsRWBqidEcX3qkBer6hu2kGNVXBtY1n1xl2tNm
LfQDcWaEpLBK8B4J+ddBGvgomF5qo5Jo3TPyBYh5NHjxoS5OJpKHDdYXyEDzRyK9
Yi3E/FLa1aFcJIA2hIdxLUFHz3QzWuCZhM9R6QlKtnIpQV+PKcL+eOltgSuzuxLq
zFm2qB+4HnujngllduH7b45dhiFSMjAr3XcF8+iNc0Cki6DFv9ot8W3mZFx+HZyu
KWvNem1zq1AsaaMsBpEMTIf5ptQXVQ3b5f/ByXEQaayfWqG1fC7arat15FV51LSG
6wIDAQAB
-----END PUBLIC KEY-----`;
    // Load the public key using node-forge
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Fiscal code and conversion to Buffer
    const fiscalCode = "ABCDE12345";
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
    const w = 64; // Word size
    const nb = 32; // Number of limbs (64 limbs for a 2048-bit modulus)

    /*// Prepare the inputs for the circuit
    const inputs = {
      fiscal_code: bigint_to_array(w, nb, BigInt("0x" + Buffer.from(fiscalCode, "utf8").toString("hex"))), // Fiscal code
      cipher_text: bigint_to_array(w, nb, BigInt("0x" + Buffer.from(cipherText, "utf8").toString("hex"))), // Encrypted fiscal code
      public_key: bigint_to_array(w, nb, BigInt("0x" + publicKey.n.toString(16))), // RSA modulus
      exp: bigint_to_array(w, nb, BigInt(publicKey.e.toString())), // RSA public exponent
    };*/

    // Prepare the inputs for the circuit
    const inputs = {
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

////////////////////////
////////////////////////
////////////////////////
////////////////////////

router.get("/verify_signature", async (req: Request, res: Response) => {
  try {
    // Define constants matching your circuit parameters
    const MAX_SIGN_ATTRS_LENGTH = 1024; // Should match maxSignAttrsLength in your circuit
    const N = 121; // Number of bits per chunk
    const K = 17; // Number of chunks

    // Ensure that N and K satisfy the circuit constraints
    if (N * K <= 2048 || N >= 255 / 2) {
      throw new Error("Invalid N and K values for the circuit constraints");
    }

    // Path to the certificate and PKCS#7 files
    const certPath = path.join(__dirname, "../../temp/SAVINOMATTEO.cer");
    const p7mPath = path.join(__dirname, "../../temp/prova.txt.p7m");

    // Read and parse the certificate
    const certData = fs.readFileSync(certPath);
    const certDer = certData.toString("binary");
    const certAsn1 = forge.asn1.fromDer(certDer);
    const cert = forge.pki.certificateFromAsn1(certAsn1);
    const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;

    // Extract the modulus (n) and exponent (e)
    const modulus = BigInt(publicKey.n.toString(10));
    const exponent = publicKey.e.toString(10);

    if (exponent !== "65537") {
      throw new Error("Public exponent is not 65537");
    }

    // Split the modulus into K chunks of N bits
    const modulusChunks = bigIntToChunkedBytes(modulus, N, K);

    // Read and parse the PKCS#7 signed data
    const p7mData = fs.readFileSync(p7mPath);
    const p7Der = p7mData.toString("binary");
    const p7Asn1 = forge.asn1.fromDer(p7Der);
    const p7 = forge.pkcs7.messageFromAsn1(p7Asn1) as forge.pkcs7.PkcsSignedData;

    // Ensure that there is at least one signer
    if (!p7 || !p7.signers || p7.signers.length === 0) {
      throw new Error("Not a signed data message");
    }

    // Extract the signature and signed attributes
    const signerInfo = p7.signers[0];
    const signatureBytes = signerInfo.signature as string; // Byte string
    const signatureHex = forge.util.bytesToHex(signatureBytes);
    const signatureBigInt = BigInt("0x" + signatureHex);

    // Split the signature into K chunks of N bits
    const signatureChunks = bigIntToChunkedBytes(signatureBigInt, N, K);

    // Extract signed attributes as bytes
    const signedAttrsAsn1: forge.asn1.Asn1 = {
      tagClass: forge.asn1.Class.CONTEXT_SPECIFIC,
      type: 0, // Attributes are typically of type [0]
      constructed: true,
      value: signerInfo.authenticatedAttributes as forge.asn1.Asn1[],
    };
    const signedAttrsDer = forge.asn1.toDer(signedAttrsAsn1).getBytes();
    const signedAttrsBytes = Uint8Array.from(signedAttrsDer, (c) => c.charCodeAt(0));

    // Check signed attributes length
    const signAttrsLength = signedAttrsBytes.length;
    if (signAttrsLength > MAX_SIGN_ATTRS_LENGTH) {
      throw new Error("Signed attributes length exceeds MAX_SIGN_ATTRS_LENGTH");
    }

    // Pad signed attributes to MAX_SIGN_ATTRS_LENGTH
    const signAttrsPadded = new Uint8Array(MAX_SIGN_ATTRS_LENGTH);
    signAttrsPadded.set(signedAttrsBytes);

    // Convert signed attributes to array of integers
    const signAttrsArray = Uint8ArrayToCharArray(signAttrsPadded);

    // Convert modulus and signature chunks to strings
    const modulusChunksStr = modulusChunks.map((chunk) => chunk.toString());
    const signatureChunksStr = signatureChunks.map((chunk) => chunk.toString());

    // Prepare the circuit input object
    const circuitInput = {
      signAttrs: signAttrsArray,
      signAttrsLength: signAttrsLength.toString(),
      signature: signatureChunksStr,
      pubkey: modulusChunksStr,
    };

    // Return the circuit input as JSON
    res.json(circuitInput);
  } catch (err) {
    console.error("Error generating circuit input:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error occurred" });
  }
});

////////////////////////////

export default router;
