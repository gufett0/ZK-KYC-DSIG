pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";
include "./Hash.circom";

//DONE
//Code similar to the one used at the beginning of zk-email email-verifier.circom
template FormatterAndSignatureVerifier(maxDataLength, keyLength, chunksBitLength, totalChunksNumber) {
    assert(maxDataLength % 64 == 0);
    assert(chunksBitLength * totalChunksNumber > keyLength);
    assert(chunksBitLength < (((keyLength \8)-1) \ 2));
    
    signal input data[maxDataLength];
    signal input dataLength;
    signal input signature[totalChunksNumber];
    signal input publicKey[totalChunksNumber];

    signal output sha[256] <== Hash(maxDataLength)(data, dataLength);

    var rsaMessageSize = (256 + chunksBitLength) \ chunksBitLength;
    component rsaMessage[rsaMessageSize];
    for (var i = 0; i < rsaMessageSize; i++) {
        rsaMessage[i] = Bits2Num(chunksBitLength);
    }
    for (var i = 0; i < 256; i++) {
        rsaMessage[i \ chunksBitLength].in[i % chunksBitLength] <== sha[255 - i];
    }
    for (var i = 256; i < chunksBitLength * rsaMessageSize; i++) {
        rsaMessage[i \ chunksBitLength].in[i % chunksBitLength] <== 0;
    }

    component rsaVerifier = RSAVerifier65537(chunksBitLength, totalChunksNumber);
    for (var i = 0; i < rsaMessageSize; i++) {
        rsaVerifier.message[i] <== rsaMessage[i].out;
    }
    for (var i = rsaMessageSize; i < totalChunksNumber; i++) {
        rsaVerifier.message[i] <== 0;
    }
    rsaVerifier.modulus <== publicKey;
    rsaVerifier.signature <== signature;
}
