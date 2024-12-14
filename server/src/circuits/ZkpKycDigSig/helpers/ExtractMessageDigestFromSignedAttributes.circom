pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";

//DONE
template ExtractMessageDigestFromSignedAttributes(maxSignedAttributesLength, maxMessageDigestLength) {
    signal input SignedAttributes[maxSignedAttributesLength];
    signal input SignedAttributesLength;
    signal input MessageDigestPatternStartingIndex;
    signal output MessageDigest[maxMessageDigestLength];

    //6 => 0x06 (OBJECT IDENTIFIER)
    //9 => 0x09 (length of the OID)
    //42 134 72 134 247 13 1 9 4 => 0x2A 86 48 86 F7 0D 01 09 04 (OID for message digest)
    //49 => 0x31 (Asn1 SET tag)
    //34 => 0x22 (length of the SET)
    //4 => 0x04 (OCTET STRING tag) specify the format of the message digest
    //32 => 0x20 (length of the message digest) == 32 bytes == 256 bits
    var messageDigestPatternLength = 15;
    var messageDigestPattern[messageDigestPatternLength] = [6,9,42,134,72,134,247,13,1,9,4,49,34,4,32];

    assert(maxSignedAttributesLength > SignedAttributesLength);
    assert(SignedAttributesLength > 0);
    assert(maxMessageDigestLength > 0);
    assert(messageDigestPatternLength > 0);
    assert(MessageDigestPatternStartingIndex + messageDigestPatternLength + maxMessageDigestLength <= maxSignedAttributesLength);


    signal MessageDigestWithPattern[maxMessageDigestLength + messageDigestPatternLength];
    MessageDigestWithPattern <== VarShiftLeft(maxSignedAttributesLength, maxMessageDigestLength + messageDigestPatternLength)(SignedAttributes, MessageDigestPatternStartingIndex);

    //Check if the first bytes match the known pattern
    component patternMatchCheck = CheckSubstringMatch(messageDigestPatternLength);
    for (var i = 0; i < messageDigestPatternLength; i++) {
        patternMatchCheck.in[i] <== MessageDigestWithPattern[i];
        patternMatchCheck.substring[i] <== messageDigestPattern[i];
    }
    patternMatchCheck.isMatch === 1;

    //Fill the message digest excluding the pattern
    for (var i = 0; i < maxMessageDigestLength; i++) {
        MessageDigest[i] <== MessageDigestWithPattern[messageDigestPatternLength + i];
    }
}