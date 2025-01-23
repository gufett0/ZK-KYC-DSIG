pragma circom 2.2.0;

include "circomlib/circuits/sha256/sha256.circom"; // Correct this path

template FiscalCodeHash256Check(NUM_BITS) {
    signal input fiscal_code_bits[NUM_BITS];

    signal input expected_hash[256];

    signal output computed_hash[256] <== Sha256(NUM_BITS)(fiscal_code_bits);
    computed_hash === expected_hash;
}

component main = FiscalCodeHash256Check(128);