pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";

//Working on it
template VerifyHash(maxBytesLength) {
    //byte array
    signal input paddedBytes[maxBytesLength];
    //byte array length
    signal input paddedBytesLength;
    //byte sha hash
    signal input sha[32];
    //boolean if match
    signal output isMatch;

    signal output sha[256] <== Hash(maxBytesLength)(paddedBytes, paddedBytesLength);
}