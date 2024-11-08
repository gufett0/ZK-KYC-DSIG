pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom"; // Ensure this path matches your file structure

template RSAVerificationCircuit(n, k) {
    // Define inputs
    signal input fiscal_code[k];     // The message in chunks representing the fiscal code
    signal input cipher_text[k];   // The RSA signature in chunks
    signal input public_key[k]; // The modulus (public key) in chunks

   // Instantiate the RSAVerifier65537 component
    component rsaVerifier = RSAVerifier65537(n, k);

    // Connect the inputs to the component
    rsaVerifier.message <== fiscal_code;
    rsaVerifier.signature <== cipher_text;
    rsaVerifier.modulus <== public_key;
}

// Define main component with default parameters for n and k
component main = RSAVerificationCircuit(64, 32);
