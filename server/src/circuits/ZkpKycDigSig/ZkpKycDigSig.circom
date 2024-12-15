pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/lib/rsa.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/regex.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";
include "./helpers/FormatterAndSignatureVerifier.circom";
include "./helpers/ExtractMessageDigestFromSignedAttributes.circom";
include "./helpers/VerifyHash.circom";

template ZkpKycDigSig(maxSignedAttributesLength, maxCertificateTbsLength, maxContentLength, chunksBitLength, totalChunksNumber) {

    signal input SignedAttributes[maxSignedAttributesLength];
    signal input SignedAttributesLength;
    signal input Signature[totalChunksNumber];
    signal input PublicKeyModulus[totalChunksNumber];

    signal input CertificateTbs[maxCertificateTbsLength];
    signal input CertificateTbsLength;
    signal input CertificateSignature[totalChunksNumber];
    signal input CaPublicKeyModulus[totalChunksNumber];
    
    signal input JudgePublicKeyModulus[totalChunksNumber];
    signal input MessageDigestPatternStartingIndex;
    var maxMessageDigestLength = 32;

    signal input Content[maxContentLength];

    //Verify the SIGNATURE of the signed attributes and of the certificate
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

    //Verify the MESSAGE DIGEST from the signed attributes
    //Extract it
    component messageDigestExtractor = ExtractMessageDigestFromSignedAttributes(maxSignedAttributesLength, maxMessageDigestLength);
    messageDigestExtractor.SignedAttributes <== SignedAttributes;
    messageDigestExtractor.SignedAttributesLength <== SignedAttributesLength;
    messageDigestExtractor.MessageDigestPatternStartingIndex <== MessageDigestPatternStartingIndex;

    signal MessageDigest[maxMessageDigestLength] <== messageDigestExtractor.MessageDigest;

    //Verify it with the padded content
    component verifyHash = VerifyHash(maxContentLength);
    verifyHash.bytes <== Content;
    verifyHash.expectedSha <== MessageDigest;

    verifyHash.isMatch === 1;
    
    //TODO Continue
    //1st step call the ExtractMessageDigestFromSignedAttributes to get the message digest. The function must be implemented.
    //2nd step call Sha256 on the content and compare it with the message digest. I need to define the format of the content.
}

component main = ZkpKycDigSig(512,2048,344,121,17);