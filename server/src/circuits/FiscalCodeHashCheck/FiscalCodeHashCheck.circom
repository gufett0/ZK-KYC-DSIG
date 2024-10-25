pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/poseidon.circom";

template FiscalCodeHashCheck(NUM_ELEMENTS) {
    // Private input: fiscal code represented as an array of field elements
    signal input fiscal_code[NUM_ELEMENTS];

    // Public input: expected hash of the fiscal code
    signal input expected_hash;

    // Public output: the computed hash
    signal output computed_hash;

    // Instantiate the Poseidon hash component
    component poseidonHasher = Poseidon(NUM_ELEMENTS);

    // Connect inputs to the hasher
    for (var i = 0; i < NUM_ELEMENTS; i++) {
        poseidonHasher.inputs[i] <== fiscal_code[i];
    }

    // Set the computed hash as the output
    computed_hash <== poseidonHasher.out;

    // Enforce that the computed hash equals the expected hash
    computed_hash === expected_hash;
}

component main = FiscalCodeHashCheck(16);

