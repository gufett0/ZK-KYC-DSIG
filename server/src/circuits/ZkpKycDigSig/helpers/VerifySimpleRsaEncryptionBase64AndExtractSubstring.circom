pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/lib/rsa.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/regex.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/bitify.circom";

template VerifySimpleRsaEncryptionBase64AndExtractSubstring(maxBytesLength, maxBase64Length, maxSubstringLength, chunksBitLength, totalChunksNumber) {
    signal input SignatureBase64[maxBase64Length];
    signal input PublicKeyModulus[totalChunksNumber];
    signal input Message[maxBytesLength];
    signal input IndexOfPartialMessage;
    signal input MessageLength;
    signal output Substring[maxSubstringLength];

    assert(MessageLength <= maxBytesLength);
    //Since we expect a json we add to the maxlen 2 for the quotes and the parenthesis
    var substringAndMoreLength = maxSubstringLength + 2;
    assert(IndexOfPartialMessage <= (MessageLength-substringAndMoreLength));
    AssertZeroPadding(maxBytesLength)(Message, MessageLength);

    //Decode the signature and split it in chunks
    signal Signature[maxBytesLength] <== Base64Decode(maxBytesLength)(SignatureBase64);
    signal ChunkedSignature[totalChunksNumber] <== SplitBytesToWords(maxBytesLength,chunksBitLength,totalChunksNumber)(Signature);

    //Split data in chunks
    signal ChunkedMessage[totalChunksNumber] <== SplitBytesToWords(maxBytesLength,chunksBitLength,totalChunksNumber)(Message);


    //Check that the signature is in proper form and reduced mod modulus.
    component signatureRangeCheck[totalChunksNumber];
    component bigLessThan = BigLessThan(chunksBitLength, totalChunksNumber);
    for (var i = 0; i < totalChunksNumber; i++) {
        signatureRangeCheck[i] = Num2Bits(chunksBitLength);
        signatureRangeCheck[i].in <== ChunkedSignature[i];
        bigLessThan.a[i] <== ChunkedSignature[i];
        bigLessThan.b[i] <== PublicKeyModulus[i];
    }
    bigLessThan.out === 1;

    //Check the rsa ciphertext
    component bigPow = FpPow65537Mod(chunksBitLength, totalChunksNumber);
    bigPow.base <== ChunkedMessage;//ChunkedMessage;
    bigPow.modulus <== PublicKeyModulus;

    /*for (var i = 0; i < totalChunksNumber; i++) {
        log(bigPow.out[i],ChunkedSignature[i],ChunkedMessage[i]);
    }*/

    //TODO: Check that the signature is correct
    /*for (var i = 0; i < totalChunksNumber; i++) {
        bigPow.out[i] === ChunkedSignature[i];
    }*/

    Substring <== VarShiftLeft(maxBytesLength, maxSubstringLength)(Message, IndexOfPartialMessage);
}

