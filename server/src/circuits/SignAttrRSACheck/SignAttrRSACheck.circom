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

/// @input signAttrs[maxSignAttrsLength] Signed attributes that are signed as ASCII int[], padded as per SHA-256 block size.
/// @input signAttrsLength Length of the signed attributes including the SHA-256 padding.
/// @input signature[k] RSA signature split into k chunks of n bits each.
/// @input pubkey[k] RSA public key split into k chunks of n bits each.
/// @output sha[256] SHA-256 hash of the signed attributes.
template SignAttrRSACheck(maxSignAttrsLength, n, k) {
    assert(maxSignAttrsLength % 64 == 0);
    assert(n * k > 2048); // to support 2048 bit RSA
    assert(n < (255 \ 2));
    
    // Define inputs
    signal input signAttrs[maxSignAttrsLength];  // The signed attributes in chunks
    signal input signAttrsLength;               // The length of the signed attributes
    signal input signature[k];   // The RSA signature in chunks
    signal input publicKey[k]; // The modulus (public key) in chunks

    component n2bSignAttrsLength = Num2Bits(log2Ceil(maxSignAttrsLength));
    n2bSignAttrsLength.in <== signAttrsLength;

    AssertZeroPadding(maxSignAttrsLength)(signAttrs, signAttrsLength);

    signal output sha[256] <== Sha256Bytes(maxSignAttrsLength)(signAttrs, signAttrsLength);

    var rsaMessageSize = (256 + n) \ n;
    component rsaMessage[rsaMessageSize];
    for (var i = 0; i < rsaMessageSize; i++) {
        rsaMessage[i] = Bits2Num(n);
    }
    for (var i = 0; i < 256; i++) {
        rsaMessage[i \ n].in[i % n] <== sha[255 - i];
    }
    for (var i = 256; i < n * rsaMessageSize; i++) {
        rsaMessage[i \ n].in[i % n] <== 0;
    }

    // Verify RSA signature - 149,251 constraints
    component rsaVerifier = RSAVerifier65537(n, k);
    for (var i = 0; i < rsaMessageSize; i++) {
        rsaVerifier.message[i] <== rsaMessage[i].out;
    }
    for (var i = rsaMessageSize; i < k; i++) {
        rsaVerifier.message[i] <== 0;
    }
    rsaVerifier.modulus <== publicKey;
    rsaVerifier.signature <== signature;
}

// Define main component with default parameters for n and k
component main = SignAttrRSACheck(1024, 121, 17);
