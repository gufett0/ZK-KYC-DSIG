import crypto from "crypto";
import { wasm as wasm_tester } from "circom_tester";
import path from "path";

// Generate random text and its SHA-256 hash
function generateTestInputs() {
  const randomText = crypto.randomBytes(16).toString("hex"); // Generate random 16-byte text in hex
  const hash = crypto.createHash("sha256").update(randomText).digest();

  // Convert the text to bits
  const textBits = Array.from(randomText).flatMap((char) => {
    const bits = char.charCodeAt(0).toString(2).padStart(8, "0");
    return bits.split("").map(Number);
  });

  // Convert hash to an array of bits
  const hashBits = Array.from(hash).flatMap((byte) => {
    const bits = byte.toString(2).padStart(8, "0");
    return bits.split("").map(Number);
  });

  return { textBits, hashBits };
}

// describe("FiscalCodeHash256Check Circuit Test", () => {
//   let circuit: any = null;

//   beforeAll(async () => {
//     // Load the circuit using an absolute path for better reliability
//     circuit = await wasm_tester(
//       path.join(__dirname, "../circuits/FiscalCodeHash256Check/FiscalCodeHash256Check.circom")
//     );
//   });

//   it("should match the computed hash with the expected hash", async () => {
//     const { textBits, hashBits } = generateTestInputs();

//     // Prepare the input for the circuit
//     const input = {
//       fiscal_code_bits: textBits,
//       expected_hash: hashBits,
//     };

//     // Calculate witness
//     const witness = await circuit.calculateWitness(input, true);

//     // Verify that computed_hash equals expected_hash
//     for (let i = 0; i < 256; i++) {
//       expect(witness[i + 1]).toBe(hashBits[i]);
//     }
//   });
// });
