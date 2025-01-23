pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/sha256/sha256.circom";

template VerifyHash(maxBytesLength) {
    var shaBitLength = 256;
    var shaByteLength = 32;
    //byte array
    signal input bytes[maxBytesLength];
    //byte array hash
    signal input expectedSha[shaByteLength];

    //convert expectedSha to bits
    component expectedSha2bits[shaByteLength];
    signal expectedShaBits[shaBitLength];
    for (var i = 0; i < shaByteLength; i++) {
        assert(expectedSha[i] >= 0 && expectedSha[i] < 256);
        expectedSha2bits[i] = Num2Bits(8);
        expectedSha2bits[i].in <== expectedSha[i];
        for (var j = 0; j < 8; j++) {
            expectedShaBits[i * 8 + j] <== expectedSha2bits[i].out[7-j];
        }
    }
    
    //Convert bytes to bits
    component byte2bits[maxBytesLength];
    signal bytesBits[maxBytesLength*8];
    for (var i = 0; i < maxBytesLength; i++) {
        assert(bytes[i] >= 0 && bytes[i] < 256);
        byte2bits[i] = Num2Bits(8);
        byte2bits[i].in <== bytes[i];
        for (var j = 0; j < 8; j++) {
            bytesBits[i * 8 + j] <== byte2bits[i].out[7-j];
        }
    }

    //Compute the hash
    signal computedShaBits[shaBitLength] <== Sha256(maxBytesLength*8)(bytesBits);

    //Verify equality
    for (var i = 0; i < shaBitLength; i++) {
        computedShaBits[i] === expectedShaBits[i];
    }
}