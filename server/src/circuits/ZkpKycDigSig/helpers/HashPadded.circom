pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";

//Hash a padded byte array
template HashPadded(maxBytesLength) {
    signal input paddedBytes[maxBytesLength];
    signal input paddedBytesLength;

    //Assertions
    component n2bBytesLength = Num2Bits(log2Ceil(maxBytesLength));
    n2bBytesLength.in <== paddedBytesLength;
    assert(maxBytesLength > paddedBytesLength);
    AssertZeroPadding(maxBytesLength)(paddedBytes, paddedBytesLength);

    //Compute hash
    signal output sha[256] <== Sha256Bytes(maxBytesLength)(paddedBytes, paddedBytesLength);
}