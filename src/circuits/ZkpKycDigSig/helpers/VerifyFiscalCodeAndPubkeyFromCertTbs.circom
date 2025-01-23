pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";


template VerifyFiscalCodeAndPubkeyFromCertTbs(maxCertificateTbsLength,maxFiscalCodeLength,chunksBitLength,totalChunksNumber) {
    signal input CertificateTbs[maxCertificateTbsLength];
    signal input CertificateTbsLength;
    signal input FiscalCodePatternStartingIndex;
    signal input PublicKeyModulusPatternStartingIndex;
    signal input FiscalCode[maxFiscalCodeLength];
    signal input PublicKeyModulus[totalChunksNumber];

    //ASN1 pattern for fiscal code
    var fiscalCodePatternLength = 13;
    var fiscalCodePattern[fiscalCodePatternLength] = [
        // (1) OID: 06 03 55 04 05
        6, 3, 85, 4, 5,
        // (2) Tag for PrintableString (0x13):
        19,
        // (3) Length (6 bytes 'TINIT-' + 16 bytes FISCAL CODE):
        22,
        // (4) First 6 bytes for "TINIT-" (Modify IT for other countries)
        84, 73, 78, 73, 84, 45
    ];

    //ASN1 pattern for public key modulus
    var publicKeyModulusPatternLength = 27;
    var publicKeyModulusPattern[publicKeyModulusPatternLength] = [
        // (1) RSA OID:  06 09 2A 86 48 86 F7 0D 01 01 01
        6,   9,   42,  134,  72,  134,  247,  13,   1,   1,   1,
        // (2) NULL parameters: 05 00
        5,   0,
        // (3) BIT STRING tag & length: 03 82 01 0F
        3, 130,   1,   15,
        // (4) Unused bits in BIT STRING: 00
        0,
        // (5) SEQUENCE (RSAPublicKey) tag & length: 30 82 01 0A
        48, 130,   1,   10,
        // (6) INTEGER (modulus) tag & length: 02 82 01 01
        2,  130,   1,   1,
        // (7) Leading 0 byte for the INTEGER
        0
    ];

    //Extract the fiscal code with its ASN1 pattern in front
    signal FiscalCodeWithPattern[maxFiscalCodeLength + fiscalCodePatternLength];
    FiscalCodeWithPattern <== VarShiftLeft(maxCertificateTbsLength, maxFiscalCodeLength + fiscalCodePatternLength)(CertificateTbs, FiscalCodePatternStartingIndex);

    //Extract the public key modulus with its ASN1 pattern in front
    var maxPublicKeyModulusLength = 256; //byte length of a 2048 bit key
    signal PublicKeyModulusWithPattern[maxPublicKeyModulusLength+ publicKeyModulusPatternLength];
    PublicKeyModulusWithPattern <== VarShiftLeft(maxCertificateTbsLength, maxPublicKeyModulusLength + publicKeyModulusPatternLength)(CertificateTbs, PublicKeyModulusPatternStartingIndex);

    //Check if the first bytes match the known pattern for fiscal code
    component patternMatchCheckFiscalCode = CheckSubstringMatch(fiscalCodePatternLength+maxFiscalCodeLength);
    for (var i = 0; i < fiscalCodePatternLength; i++) {
        patternMatchCheckFiscalCode.in[i] <== FiscalCodeWithPattern[i];
        patternMatchCheckFiscalCode.substring[i] <== fiscalCodePattern[i];
    }
    
    //Verify the fiscal code correspondence with the one passed as input
    for(var i = 0; i < maxFiscalCodeLength; i++){
        patternMatchCheckFiscalCode.in[fiscalCodePatternLength+i] <== FiscalCodeWithPattern[fiscalCodePatternLength+i];
        patternMatchCheckFiscalCode.substring[fiscalCodePatternLength+i] <== FiscalCode[i];
    }
    patternMatchCheckFiscalCode.isMatch === 1;

    //Check if the first bytes match the known pattern for public key modulus
    component patternMatchCheckModulus = CheckSubstringMatch(publicKeyModulusPatternLength);
    for (var i = 0; i < publicKeyModulusPatternLength; i++) {
        patternMatchCheckModulus.in[i] <== PublicKeyModulusWithPattern[i];
        patternMatchCheckModulus.substring[i] <== publicKeyModulusPattern[i];
    }
    patternMatchCheckModulus.isMatch === 1;

    //Extract the public key modulus and chunk it to verify its correspondence with the one passed as input
    signal ExtractedPublicKeyModulus[maxPublicKeyModulusLength] <== VarShiftLeft(publicKeyModulusPatternLength+maxPublicKeyModulusLength, maxPublicKeyModulusLength)(PublicKeyModulusWithPattern, publicKeyModulusPatternLength);
    signal ChunkedPublicKeyModulus[totalChunksNumber] <== SplitBytesToWords(maxPublicKeyModulusLength,chunksBitLength,totalChunksNumber)(ExtractedPublicKeyModulus);

    for(var i = 0; i < totalChunksNumber; i++){
        ChunkedPublicKeyModulus[i] === PublicKeyModulus[i];
    }
}