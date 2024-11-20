pragma circom 2.2.0;

// Adjust the import path according to your folder structure
include "@zk-email/circuits/lib/rsa.circom";

template FiscalCodeRsaCheck(w, nb) {
    // Inputs
    signal input fiscal_code[nb]; // Fiscal code (private input)
    signal input cipher_text[nb];         // Encrypted fiscal code (public input)
    signal input public_key[nb];          // RSA modulus N (public input)
    
    // Outputs
    // Output of modular exponentiation
    // Instantiate the PowerMod component with parameters
    signal output cipher_text_out[nb] <== FpPow65537Mod(w, nb)(fiscal_code, public_key);

    cipher_text_out === cipher_text;
}

// Instantiate the main component with specified parameters
component main {public [public_key]} = FiscalCodeRsaCheck(64, 32);