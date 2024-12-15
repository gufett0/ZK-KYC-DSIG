pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";

//DONE //to test //not used 
template VerifyHashPadded(maxBytesLength) {
    var shaBitLength = 256;
    var shaByteLength = 32;
    //byte array
    signal input paddedBytes[maxBytesLength];
    //byte array length
    signal input paddedBytesLength;
    //byte sha hash
    signal input expectedSha[shaByteLength];
    //boolean if match
    signal output isMatch;

    assert(paddedBytesLength <= maxBytesLength);

    signal computedShaBits[shaBitLength] <== Hash(maxBytesLength)(paddedBytes, paddedBytesLength);

    component byte2bits[shaByteLength];
    signal expectedShaBits[shaBitLength];

    for (var i = 0; i < shaByteLength; i++) {
        assert(expectedSha[i] < 256);
        byte2bits[i] = Num2Bits(8);
        byte2bits[i].in <== expectedSha[i];
        for (var j = 0; j < 8; j++) {
            expectedShaBits[i * 8 + j] <== byte2bits[i].out[7-j];
        }
    }
    

    for (var i = 0; i < shaBitLength; i++) {
        expectedShaBits[i] === computedShaBits[i];
    }

    isMatch <== 1;
}