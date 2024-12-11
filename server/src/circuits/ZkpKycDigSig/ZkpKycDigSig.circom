pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom"; // Ensure this path matches your file structure
include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/lib/rsa.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/regex.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";
include "./helpers/FormatterAndSignatureVerifier.circom";

template ZkpKycDigSig(maxSignedAttributesLength, maxCertificateTbsLength, chunksBitLength, totalChunksNumber) {

    signal input SignedAttributes[maxSignedAttributesLength];
    signal input SignedAttributesLength;
    signal input Signature[totalChunksNumber];
    signal input PublicKeyModulus[totalChunksNumber];

    signal input CertificateTbs[maxCertificateTbsLength];
    signal input CertificateTbsLength;
    signal input CertificateSignature[totalChunksNumber];
    signal input CaPublicKeyModulus[totalChunksNumber];
    
    signal input JudgePublicKeyModulus[totalChunksNumber];
    signal input MessageDigest[32];
    //signal input Content[maxContentLength]; //error should be different

    component signatureVerify = FormatterAndSignatureVerifier(maxSignedAttributesLength,2048, chunksBitLength, totalChunksNumber);
    component certificateSignatureVerify= FormatterAndSignatureVerifier(maxCertificateTbsLength,2048, chunksBitLength, totalChunksNumber);

    signatureVerify.data <== SignedAttributes;
    signatureVerify.dataLength <== SignedAttributesLength;
    signatureVerify.signature <== Signature;
    signatureVerify.publicKey <== PublicKeyModulus;

    certificateSignatureVerify.data <== CertificateTbs;
    certificateSignatureVerify.dataLength <== CertificateTbsLength;
    certificateSignatureVerify.signature <== CertificateSignature;
    certificateSignatureVerify.publicKey <== CaPublicKeyModulus;

    //TODO Continue
}

// Define main component with default parameters for n and k
component main = ZkpKycDigSig(512,2048,121,17);