pragma circom 2.2.0;

include "circomlib/circuits/poseidon.circom";

template FiscalCodeHashCheck(NUM_ELEMENTS) {
    // Private input: fiscal code represented as an array of field elements
    signal input fiscal_code[NUM_ELEMENTS];

    // Public input: expected hash of the fiscal code
    signal input expected_hash;

    // Public output: the computed hash
    // Instantiate the Poseidon hash component
    // Set the computed hash as the output
    signal output computed_hash <== Poseidon(NUM_ELEMENTS)(fiscal_code);

    // Enforce that the computed hash equals the expected hash
    computed_hash === expected_hash;
}

component main = FiscalCodeHashCheck(16);

