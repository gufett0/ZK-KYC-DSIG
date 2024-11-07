pragma circom 2.2.0;

// Adjust the import path according to your folder structure
include "circom-rsa-verify/circuits/pow_mod.circom";

template FiscalCodeRsaCheck(w, nb, e_bits) {
    // Inputs
    signal input fiscal_code[nb]; // Fiscal code (private input)
    signal input cipher_text[nb];         // Encrypted fiscal code (public input)
    signal input public_key[nb];          // RSA modulus N (public input)
    signal input exp[nb];                 // Exponent e (public input as limbs)
    
    // Outputs
    signal output cipher_text_out[nb];      // Output of modular exponentiation


    // Log each element of the arrays individually
    for (var i = 0; i < nb; i++) {
        log("fc");
        log(fiscal_code[i]);
        log("ct");
        log(cipher_text[i]);
    }
    
    // Instantiate the PowerMod component with parameters
    component powmod = PowerMod(w, nb, e_bits);

    // Connect inputs to powmod
    for (var i = 0; i < nb; i++) {
        powmod.base[i] <== fiscal_code[i];
        powmod.exp[i] <== exp[i];
        powmod.modulus[i] <== public_key[i];
    }

    for (var i = 0; i < nb; i++) {
        cipher_text_out[i] <== powmod.out[i];
    }

    // Log each element of the arrays individually
    for (var i = 0; i < nb; i++) {
        log("fc");
        log(fiscal_code[i]);
        log("ct");
        log(cipher_text[i]);
        log("cfo");
        log(cipher_text_out[i]);
    }

    // Ensure the computed ciphertext matches the provided ciphertext
    for (var i = 0; i < nb; i++) {
        cipher_text_out[i] === cipher_text[i];
    }

    // Log each element of the arrays individually
    for (var i = 0; i < nb; i++) {
        log("fc");
        log(fiscal_code[i]);
        log("cfc");
        log(cipher_text_out[i]);
    }
}

// Instantiate the main component with specified parameters
component main {public [public_key,exp]} = FiscalCodeRsaCheck(64, 32, 17);