pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom"; // Ensure this path matches your file structure

template RSAVerificationCircuit(n, k) {
    // Define inputs
    signal input fiscalCode[k];     // The message in chunks representing the fiscal code
    signal input rsaSignature[k];   // The RSA signature in chunks
    signal input publicKeyModulus[k]; // The modulus (public key) in chunks

    // Instantiate the RSAVerifier65537 component
    component rsaVerifier = RSAVerifier65537(n, k);

    // Connect the fiscalCode (message), rsaSignature, and publicKeyModulus to the verifier
    rsaVerifier.message <== fiscalCode;
    rsaVerifier.signature <== rsaSignature;
    rsaVerifier.modulus <== publicKeyModulus;
    
    // The circuit's output is implicitly checked by RSAVerifier65537, so no extra output is required
}

// Define main component with default parameters for n and k
component main = RSAVerificationCircuit(121, 17);
