pragma circom 2.2.0;

include "../../../node_modules/circomlib/circuits/sha256/sha256.circom"; // Ensure this path is correct based on your project structure

//TODO
template FiscalCodeHash256Check(NUM_BITS) {
    // Private input: fiscal code represented as bits
    signal input fiscal_code_bits[NUM_BITS];

    // Public input: expected hash of the fiscal code (256 bits)
    signal input expected_hash[256];

    // Output: computed hash
    signal output computed_hash[256] <== Sha256(NUM_BITS)(fiscal_code_bits);

    computed_hash === expected_hash;
}

component main = FiscalCodeHash256Check(128);