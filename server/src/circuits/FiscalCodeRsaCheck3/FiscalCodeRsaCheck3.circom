pragma circom 2.2.0;

// Adjust the import path according to your folder structure
include "@zk-email/circuits/lib/rsa.circom";

component main { public [modulus] } = RSAVerifier65537(121, 17);