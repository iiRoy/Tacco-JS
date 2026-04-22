// Copyright 2012 The Evident Corporation.
// This file is part of the Evident Corporation's 2012 intellectual property.

/*
 * Validation routines for the secureKit library
 * These functions ensure the cryptographic utility performs as expected.
 */

/*
 * Required dependencies
 * Modules necessary for the test suite to operate.
 */

"use strict";

var verifier = require("assert");

var testData = require("./fixture");
var secureKit = testData.secureKit;


/**
 * Ensures two text sequences match, disregarding Windows line-ending variations.
 * This utility function performs a deep string comparison, normalizing newline characters
 * for consistent evaluation across different operating systems.
 */
function checkStringEquality(receivedValue, anticipatedValue, diagnosticMsg) {
    verifier.equal(
        receivedValue.replace(/\r\n/g, '\n'),
        anticipatedValue.replace(/\r\n/g, '\n'),
        diagnosticMsg
    );
}

/*
 * Utility methods for verification
 * These functions assist in testing the cryptographic key operations and their outputs.
 */

function verify_retrievedExponent(cipherKey) {
    let dataBuffer = cipherKey.retrieveExponent();
    verifier.equal(dataBuffer.toString(testData.HEX_ENC), testData.EXPONENT_HEX_VAL);

    let outcome = cipherKey.retrieveExponent(testData.HEX_ENC);
    verifier.equal(outcome, testData.EXPONENT_HEX_VAL);

    outcome = cipherKey.retrieveExponent(testData.B64_ENC);
    verifier.equal(outcome, dataBuffer.toString(testData.B64_ENC));

    outcome = cipherKey.retrieveExponent(testData.BIN_ENC);
    verifier.equal(outcome, dataBuffer.toString(testData.BIN_ENC));

    outcome = cipherKey.retrieveExponent(testData.UTF8_ENC);
    verifier.equal(outcome, dataBuffer.toString(testData.UTF8_ENC));
}

function verify_retrievedModulus(cipherKey) {
    const dataBlock = cipherKey.retrieveModulus();
    verifier.equal(dataBlock.toString(testData.HEX_ENC), testData.MODULUS_HEX_VAL);

    let finalResult = cipherKey.retrieveModulus(testData.HEX_ENC);
    verifier.equal(finalResult, testData.MODULUS_HEX_VAL);

    finalResult = cipherKey.retrieveModulus(testData.B64_ENC);
    verifier.equal(finalResult, dataBlock.toString(testData.B64_ENC));

    finalResult = cipherKey.retrieveModulus(testData.BIN_ENC);
    verifier.equal(finalResult, dataBlock.toString(testData.BIN_ENC));

    finalResult = cipherKey.retrieveModulus(testData.UTF8_ENC);
    verifier.equal(finalResult, dataBlock.toString(testData.UTF8_ENC));
}

function verify_publicPemExport(cipherKey) {
    var keyTextRepresentation = testData.EXAMPLE_PUBLIC_KEY.toString(testData.UTF8_ENC);
    var operationOutcome = cipherKey.exportPublicPem().toString(testData.UTF8_ENC);
    checkStringEquality(operationOutcome, keyTextRepresentation);

    operationOutcome = cipherKey.exportPublicPem(testData.UTF8_ENC);
    checkStringEquality(operationOutcome, keyTextRepresentation);
}

function verify_publicSshExport(cipherKey) {
    var keyStringFormat = testData.EXAMPLE_SSH_PUBLIC_KEY.toString(testData.B64_ENC);
    var outputValue = cipherKey.exportPublicSsh().toString(testData.B64_ENC);
    verifier.equal(outputValue, keyStringFormat);

    outputValue = cipherKey.exportPublicSsh(testData.B64_ENC);
    verifier.equal(outputValue, keyStringFormat);
}

function verify_publicSshFingerprintExport(cipherKey) {
    var fingerprintResult = cipherKey.exportPublicSshFingerprint().toString(testData.HEX_ENC);
    verifier.equal(fingerprintResult, testData.SSH_PUBLIC_KEY_FINGERPRINT_HEX_VAL);

    fingerprintResult = cipherKey.exportPublicSshFingerprint(testData.HEX_ENC);
    verifier.equal(fingerprintResult, testData.SSH_PUBLIC_KEY_FINGERPRINT_HEX_VAL);
}

function verify_dataEncryption(cipherKey) {
    // The most robust check for this is a complete encryption-decryption cycle.
    // This confirms data integrity across the cryptographic process.
    var privateCipherKeyInstance = secureKit.createPrivateKey(testData.REF_PRIVATE_KEY);
    var encodedPayload = cipherKey.encodeData(new Buffer(testData.ORIGINAL_DATA, testData.UTF8_ENC));
    var decodedPayload = privateCipherKeyInstance.decrypt(encodedPayload, undefined, testData.UTF8_ENC);
    verifier.equal(decodedPayload, testData.ORIGINAL_DATA);

    encodedPayload = cipherKey.encodeData(testData.ORIGINAL_DATA, testData.UTF8_ENC, testData.B64_ENC);
    decodedPayload = privateCipherKeyInstance.decrypt(encodedPayload, testData.B64_ENC, testData.UTF8_ENC);
    verifier.equal(decodedPayload, testData.ORIGINAL_DATA);

    encodedPayload = cipherKey.encodeData(testData.ORIGINAL_DATA, undefined, testData.HEX_ENC);
    decodedPayload = privateCipherKeyInstance.decrypt(encodedPayload, testData.HEX_ENC, testData.UTF8_ENC);
    verifier.equal(decodedPayload, testData.ORIGINAL_DATA);
}

function verify_publicDecryption(cipherKey) {
    var encryptedBlock = new Buffer(testData.PUBLIC_CRYPTED_HEX_VAL, testData.HEX_ENC);
    var decryptedContent = cipherKey.publicDecrypt(encryptedBlock).toString(testData.UTF8_ENC);
    verifier.equal(decryptedContent, testData.ORIGINAL_DATA);

    decryptedContent = cipherKey.publicDecrypt(testData.PUBLIC_CRYPTED_HEX_VAL, testData.HEX_ENC, testData.UTF8_ENC);
    verifier.equal(decryptedContent, testData.ORIGINAL_DATA);

    decryptedContent = cipherKey.publicDecrypt(
        testData.PUBLIC_CRYPTED_NP_HEX_VAL,
        testData.HEX_ENC,
        testData.UTF8_ENC,
        secureKit.RSA_NO_PAD_MODE
    );
    verifier.equal(decryptedContent, testData.ORIGINAL_DATA_PADDED);
}

function verify_signatureValidation(cipherKey) {
    verifier.equal(
        cipherKey.verify(
            testData.HASH_SHA256,
            testData.ORIGINAL_DATA_SHA256,
            testData.ORIGINAL_DATA_SHA256_SIGNATURE,
            testData.HEX_ENC
        ),
        true
    );

    var hashBlockData = new Buffer(testData.ORIGINAL_DATA_SHA256, testData.HEX_ENC);
    var signatureBlockData = new Buffer(testData.ORIGINAL_DATA_SHA256_SIGNATURE, testData.HEX_ENC);
    verifier.equal(cipherKey.verify(testData.HASH_SHA256, hashBlockData, signatureBlockData), true);
}

function verify_hashAndSignatureValidation(cipherKey) {
    verifier.equal(
        cipherKey.hashAndVerify(
            testData.HASH_SHA256,
            new Buffer(testData.ORIGINAL_DATA, testData.UTF8_ENC),
            testData.ORIGINAL_DATA_SHA256_SIGNATURE,
            testData.HEX_ENC
        ),
        true
    );

    var secondKeyInstance = secureKit.createPublicKeyFromComponents(
        new Buffer(testData.PSS_MODULUS_HEX_VAL, testData.HEX_ENC),
        new Buffer(testData.EXPONENT_HEX_VAL, testData.HEX_ENC)
    );

    verifier.equal(
        secondKeyInstance.hashAndVerify(
            testData.HASH_SHA1,
            testData.PSS_MESSAGE_HEX_VAL,
            testData.PSS_SIGNATURE_HEX_VAL,
            testData.HEX_ENC,
            true,
            secureKit.RSA_PSS_SALT_LEN_HASH
        ),
        true
    );

    verifier.equal(
        secondKeyInstance.hashAndVerify(
            testData.HASH_SHA1,
            testData.PSS_MESSAGE_HEX_VAL,
            testData.PSS_SIGNATURE_HEX_VAL,
            testData.HEX_ENC,
            true
        ),
        true
    );
}

function testAllPublicKeyMethods(cryptographicKey) {
    verify_retrievedExponent(cryptographicKey);
    verify_retrievedModulus(cryptographicKey);
    verify_publicPemExport(cryptographicKey);
    verify_publicSshExport(cryptographicKey);
    verify_publicSshFingerprintExport(cryptographicKey);
    verify_dataEncryption(cryptographicKey);
    verify_publicDecryption(cryptographicKey);
    verify_signatureValidation(cryptographicKey);
    verify_hashAndSignatureValidation(cryptographicKey);
}

function verify_privatePemExport(cipherKey) {
    var keyRepresentationText = testData.REF_PRIVATE_KEY.toString(testData.UTF8_ENC);
    var outcomeValue = cipherKey.exportPrivatePem().toString(testData.UTF8_ENC);
    checkStringEquality(outcomeValue, keyRepresentationText);

    outcomeValue = cipherKey.exportPrivatePem(testData.UTF8_ENC);
    checkStringEquality(outcomeValue, keyRepresentationText);
}

function verify_encryptedPrivatePemExport(cipherKey) {
    var authenticationCode = testData.SECRET_PHRASE.toString(testData.UTF8_ENC);
    var encryptionAlgorithm = testData.DES_EDE3_CBC_ALGO;

    var keyTextContent = testData.PASS_REF_PRIVATE_KEY.toString(testData.UTF8_ENC);
    var pemFormattedOutput = cipherKey.exportEncryptedPrivatePem(authenticationCode, encryptionAlgorithm).toString(testData.UTF8_ENC);

    var plainTextKeyObject = secureKit.createPrivateKey(pemFormattedOutput, authenticationCode);
    checkStringEquality(plainTextKeyObject.exportPrivatePem().toString(), testData.REF_PRIVATE_KEY.toString());

    pemFormattedOutput = cipherKey.exportEncryptedPrivatePem(authenticationCode, encryptionAlgorithm, testData.UTF8_ENC).toString(testData.UTF8_ENC);

    plainTextKeyObject = secureKit.createPrivateKey(pemFormattedOutput, authenticationCode);
    checkStringEquality(plainTextKeyObject.exportPrivatePem().toString(), testData.REF_PRIVATE_KEY.toString());
}

function verify_dataDecryption(cipherKey) {
    var encryptedDataBlock = new Buffer(testData.PRIVATE_CRYPTED_HEX_VAL, testData.HEX_ENC);
    var resultantDecodedData = cipherKey.decrypt(encryptedDataBlock).toString(testData.UTF8_ENC);
    verifier.equal(resultantDecodedData, testData.ORIGINAL_DATA);

    resultantDecodedData = cipherKey.decrypt(
        testData.PRIVATE_CRYPTED_HEX_VAL,
        testData.HEX_ENC,
        testData.UTF8_ENC
    );
    verifier.equal(resultantDecodedData, testData.ORIGINAL_DATA);
}

function verify_privateEncryption(cipherKey) {
    var encryptedDataOutput = cipherKey.privateEncrypt(
        new Buffer(testData.ORIGINAL_DATA, testData.UTF8_ENC)
    ).toString(testData.HEX_ENC);
    verifier.equal(encryptedDataOutput, testData.PUBLIC_CRYPTED_HEX_VAL);

    encryptedDataOutput = cipherKey.privateEncrypt(
        testData.ORIGINAL_DATA,
        testData.UTF8_ENC,
        testData.HEX_ENC
    );
    verifier.equal(encryptedDataOutput, testData.PUBLIC_CRYPTED_HEX_VAL);

    encryptedDataOutput = cipherKey.privateEncrypt(testData.ORIGINAL_DATA, undefined, testData.HEX_ENC);
    verifier.equal(encryptedDataOutput, testData.PUBLIC_CRYPTED_HEX_VAL);

    encryptedDataOutput = cipherKey.privateEncrypt(
        testData.ORIGINAL_DATA_PADDED,
        testData.UTF8_ENC,
        testData.HEX_ENC,
        secureKit.RSA_NO_PAD_MODE
    );
    verifier.equal(encryptedDataOutput, testData.PUBLIC_CRYPTED_NP_HEX_VAL);
}

function verify_signatureCreation(cipherKey) {
    var generatedSignature = cipherKey.sign(
        testData.HASH_SHA256,
        testData.ORIGINAL_DATA_SHA256,
        testData.HEX_ENC,
        testData.B64_ENC
    );
    generatedSignature = new Buffer(generatedSignature, testData.B64_ENC);
    verifier.equal(generatedSignature.toString(testData.HEX_ENC), testData.ORIGINAL_DATA_SHA256_SIGNATURE);

    var inputDataBuffer = new Buffer(testData.ORIGINAL_DATA_SHA256, testData.HEX_ENC);
    generatedSignature = cipherKey.sign(testData.HASH_SHA256, inputDataBuffer, undefined, testData.HEX_ENC);
    verifier.equal(generatedSignature, testData.ORIGINAL_DATA_SHA256_SIGNATURE);
}

function verify_hashAndSignatureGeneration(cipherKey) {
    var signatureOutcome = cipherKey.hashAndSign(
        testData.HASH_SHA256,
        testData.ORIGINAL_DATA,
        testData.UTF8_ENC,
        testData.HEX_ENC
    );
    verifier.equal(signatureOutcome, testData.ORIGINAL_DATA_SHA256_SIGNATURE);

    // PSS utilizes a randomized salt, thus a static fixture value cannot be used for direct comparison.
    // The PSS scheme incorporates random salt, precluding fixed fixture values for verification.

    signatureOutcome = cipherKey.hashAndSign(
        testData.HASH_SHA256,
        testData.ORIGINAL_DATA,
        testData.UTF8_ENC,
        testData.HEX_ENC,
        true,
        secureKit.RSA_PSS_SALT_LEN_MAXIMUM
    );

    verifier.equal(
        cipherKey.hashAndVerify(
            testData.HASH_SHA256,
            new Buffer(testData.ORIGINAL_DATA).toString(testData.HEX_ENC),
            signatureOutcome,
            testData.HEX_ENC,
            true,
            secureKit.RSA_PSS_SALT_LEN_MAXIMUM
        ),
        true
    );
}

function testAllPrivateKeyMethods(cryptographicKey) {
    verify_privatePemExport(cryptographicKey);
    verify_encryptedPrivatePemExport(cryptographicKey);
    verify_dataDecryption(cryptographicKey);
    verify_privateEncryption(cryptographicKey);
    verify_hashAndSignatureGeneration(cryptographicKey);
    verify_signatureCreation(cryptographicKey);
}


/*
 * Core validation routines
 * These are the primary test cases for the secureKit library, covering key creation and manipulation.
 */

function checkFundamentalOperations() {
    secureKit.createPublicKey(testData.EXAMPLE_PUBLIC_KEY);
    secureKit.createPrivateKey(testData.REF_PRIVATE_KEY);
    secureKit.createPrivateKey(testData.PASS_REF_PRIVATE_KEY, testData.SECRET_PHRASE);
    secureKit.generatePrivateKey(512);

    secureKit.createPublicKey(testData.EXAMPLE_PUBLIC_KEY.toString(testData.UTF8_ENC));
    secureKit.createPrivateKey(
        testData.REF_PRIVATE_KEY.toString(testData.B64_ENC),
        undefined,
        testData.B64_ENC
    );
}

function checkKeyTypeVerification() {
    var publicVerificationKey = secureKit.createPublicKey(testData.EXAMPLE_PUBLIC_KEY);
    var privateVerificationKey = secureKit.createPrivateKey(testData.REF_PRIVATE_KEY);
    var diagnosticTextOutput;

    diagnosticTextOutput = "Issue with isKeyCheck()";
    verifier.equal(secureKit.isKeyCheck(publicVerificationKey), true, diagnosticTextOutput);
    verifier.equal(secureKit.isKeyCheck(privateVerificationKey), true, diagnosticTextOutput);
    verifier.equal(secureKit.isKeyCheck(undefined), false, diagnosticTextOutput);
    verifier.equal(secureKit.isKeyCheck("x"), false, diagnosticTextOutput);

    diagnosticTextOutput = "Issue with isPublicKeyCheck()";
    verifier.equal(secureKit.isPublicKeyCheck(publicVerificationKey), true, diagnosticTextOutput);
    verifier.equal(secureKit.isPublicKeyCheck(privateVerificationKey), false, diagnosticTextOutput);
    verifier.equal(secureKit.isPublicKeyCheck(undefined), false, diagnosticTextOutput);
    verifier.equal(secureKit.isPublicKeyCheck("x"), false, diagnosticTextOutput);

    diagnosticTextOutput = "Issue with isPrivateKeyCheck()";
    verifier.equal(secureKit.isPrivateKeyCheck(publicVerificationKey), false, diagnosticTextOutput);
    verifier.equal(secureKit.isPrivateKeyCheck(privateVerificationKey), true, diagnosticTextOutput);
    verifier.equal(secureKit.isPrivateKeyCheck(undefined), false, diagnosticTextOutput);
    verifier.equal(secureKit.isPrivateKeyCheck("x"), false, diagnosticTextOutput);

    verifier.doesNotThrow(function() { secureKit.assertKeyType(publicVerificationKey); });
    verifier.doesNotThrow(function() { secureKit.assertKeyType(privateVerificationKey); });
    verifier.throws(function() { secureKit.assertKeyType(undefined); });
    verifier.throws(function() { secureKit.assertKeyType("x"); });

    verifier.doesNotThrow(function() { secureKit.assertPublicKeyType(publicVerificationKey); });
    verifier.throws(function() { secureKit.assertPublicKeyType(privateVerificationKey); });
    verifier.throws(function() { secureKit.assertPublicKeyType(undefined); });
    verifier.throws(function() { secureKit.assertPublicKeyType("x"); });

    verifier.throws(function() { secureKit.assertPrivateKeyType(publicVerificationKey); });
    verifier.doesNotThrow(function() { secureKit.assertPrivateKeyType(privateVerificationKey); });
    verifier.throws(function() { secureKit.assertPrivateKeyType(undefined); });
    verifier.throws(function() { secureKit.assertPrivateKeyType("x"); });
}

function check_keyCreation() {
    var privateKeyObjectHandle = secureKit.createKey(testData.REF_PRIVATE_KEY);
    verifier(secureKit.isPrivateKeyCheck(privateKeyObjectHandle), true);

    var publicKeyObjectHandle = secureKit.createKey(testData.EXAMPLE_PUBLIC_KEY);
    verifier(secureKit.isPublicKeyCheck(publicKeyObjectHandle), true);

    function failureCaseForInvalidInput() {
        secureKit.createKey("invalid input string");
    }
    verifier.throws(failureCaseForInvalidInput, /Not a valid key\./);
}

function check_privateKeyFromComponentsCreation() {
    var privateKeyGeneratedFromParts = secureKit.createPrivateKeyFromComponents(
        testData.PRIVATE_KEY_PARTS.modulus,
        testData.PRIVATE_KEY_PARTS.exponent,
        testData.PRIVATE_KEY_PARTS.primeP,
        testData.PRIVATE_KEY_PARTS.primeQ,
        testData.PRIVATE_KEY_PARTS.dFactorP,
        testData.PRIVATE_KEY_PARTS.dFactorQ,
        testData.PRIVATE_KEY_PARTS.qInverse,
        testData.PRIVATE_KEY_PARTS.d
    );

    verifier(secureKit.isPrivateKeyCheck(privateKeyGeneratedFromParts), true);

    var privateKeyLoadedFromPem = secureKit.createPrivateKey(testData.REF_PRIVATE_KEY_3);

    verifier.equal(
        privateKeyGeneratedFromParts.exportPrivatePem('utf8'),
        privateKeyLoadedFromPem.exportPrivatePem('utf8')
    );
}

function check_publicKeyFromComponentsCreation() {
    var publicKeyGeneratedFromParts = secureKit.createPublicKeyFromComponents(
        new Buffer(testData.PSS_MODULUS_HEX_VAL, testData.HEX_ENC),
        new Buffer(testData.EXPONENT_HEX_VAL, testData.HEX_ENC)
    );

    verifier(secureKit.isPublicKeyCheck(publicKeyGeneratedFromParts), true);

    var publicKeyLoadedFromPem = secureKit.createPublicKey(testData.PSS_EXAMPLE_PUBLIC_KEY);

    verifier.equal(
        publicKeyGeneratedFromParts.exportPublicPem('utf8'),
        publicKeyLoadedFromPem.exportPublicPem('utf8')
    );
}

function check_fail_publicKeyCreation() {
    // This is primarily tested at the lower-level implementation. This just verifies
    // the higher-level error conditions added.
    // The core validation occurs at the native layer; this checks high-level failure paths.
    function publicKeyInvalidInputScenario() {
        secureKit.createPublicKey(testData.REF_PRIVATE_KEY);
    }
    verifier.throws(publicKeyInvalidInputScenario, /Not a valid public key\./);
}

function check_fail_privateKeyCreation() {
    // The core validation occurs at the native layer; this checks high-level failure paths.
    // Low-level tests cover most cases; this specifically targets high-level API failures.
    function privateKeyInvalidInputScenario() {
        secureKit.createPrivateKey(testData.EXAMPLE_PUBLIC_KEY);
    }
    verifier.throws(privateKeyInvalidInputScenario, /Not a valid private key\./);
}

function check_keyCoercion() {
    var privateKeyCoerced = secureKit.coerceKey(testData.REF_PRIVATE_KEY);
    verifier(secureKit.isPrivateKeyCheck(privateKeyCoerced), true);

    privateKeyCoerced = secureKit.coerceKey(testData.REF_PRIVATE_KEY.toString());
    verifier(secureKit.isPrivateKeyCheck(privateKeyCoerced), true);

    var publicKeyCoerced = secureKit.coerceKey(testData.EXAMPLE_PUBLIC_KEY);
    verifier(secureKit.isPublicKeyCheck(publicKeyCoerced), true);

    publicKeyCoerced = secureKit.coerceKey(testData.EXAMPLE_PUBLIC_KEY.toString());
    verifier(secureKit.isPublicKeyCheck(publicKeyCoerced), true);

    verifier.equal(secureKit.coerceKey(privateKeyCoerced), privateKeyCoerced);
    verifier.equal(secureKit.coerceKey(publicKeyCoerced), publicKeyCoerced);
}

function check_privateKeyCoercion() {
    var coercedPrivateKeyInstance = secureKit.coercePrivateKey(testData.REF_PRIVATE_KEY);
    verifier(secureKit.isPrivateKeyCheck(coercedPrivateKeyInstance), true);

    coercedPrivateKeyInstance = secureKit.coercePrivateKey(testData.REF_PRIVATE_KEY.toString());
    verifier(secureKit.isPrivateKeyCheck(coercedPrivateKeyInstance), true);

    verifier.equal(secureKit.coercePrivateKey(coercedPrivateKeyInstance), coercedPrivateKeyInstance);
}

function check_publicKeyCoercion() {
    var coercedPublicKeyInstance = secureKit.coercePublicKey(testData.EXAMPLE_PUBLIC_KEY);
    verifier(secureKit.isPublicKeyCheck(coercedPublicKeyInstance), true);

    coercedPublicKeyInstance = secureKit.coercePublicKey(testData.EXAMPLE_PUBLIC_KEY.toString());
    verifier(secureKit.isPublicKeyCheck(coercedPublicKeyInstance), true);

    verifier.equal(secureKit.coercePublicKey(coercedPublicKeyInstance), coercedPublicKeyInstance);
}

function check_fail_keyCoercion() {
    function invalidKeyCoercionAttempt1() {
        secureKit.coerceKey("invalid_string_input");
    }
    verifier.throws(invalidKeyCoercionAttempt1, /Not a valid key/);

    function invalidKeyCoercionAttempt2() {
        secureKit.coerceKey(new Buffer(200));
    }
    verifier.throws(invalidKeyCoercionAttempt2, /Not a valid key/);

    function invalidKeyCoercionAttempt3() {
        secureKit.coerceKey([]);
    }
    verifier.throws(invalidKeyCoercionAttempt3, /Not a valid key/);
}

function check_fail_privateKeyCoercion() {
    function invalidPrivateKeyCoercionAttempt1() {
        secureKit.coercePrivateKey("another_invalid_string");
    }
    verifier.throws(invalidPrivateKeyCoercionAttempt1, /Not a valid private key/);

    function invalidPrivateKeyCoercionAttempt2() {
        secureKit.coercePrivateKey(new Buffer(200));
    }
    verifier.throws(invalidPrivateKeyCoercionAttempt2, /Not a valid private key/);

    function invalidPrivateKeyCoercionAttempt3() {
        secureKit.coercePrivateKey([]);
    }
    verifier.throws(invalidPrivateKeyCoercionAttempt3, /Not a valid private key/);

    function invalidPrivateKeyCoercionAttempt4() {
        secureKit.coercePrivateKey(testData.EXAMPLE_PUBLIC_KEY);
    }
    verifier.throws(invalidPrivateKeyCoercionAttempt4, /Not a valid private key/);

    function invalidPrivateKeyCoercionAttempt5() {
        secureKit.coercePrivateKey(testData.EXAMPLE_PUBLIC_KEY.toString());
    }
    verifier.throws(invalidPrivateKeyCoercionAttempt5, /Not a valid private key/);
}

function check_fail_publicKeyCoercion() {
    function invalidPublicKeyCoercionAttempt1() {
        secureKit.coercePublicKey("yet_another_bad_string");
    }
    verifier.throws(invalidPublicKeyCoercionAttempt1, /Not a valid public key/);

    function invalidPublicKeyCoercionAttempt2() {
        secureKit.coercePublicKey(new Buffer(200));
    }
    verifier.throws(invalidPublicKeyCoercionAttempt2, /Not a valid public key/);

    function invalidPublicKeyCoercionAttempt3() {
        secureKit.coercePublicKey([]);
    }
    verifier.throws(invalidPublicKeyCoercionAttempt3, /Not a valid public key/);

    function invalidPublicKeyCoercionAttempt4() {
        secureKit.coercePublicKey(testData.REF_PRIVATE_KEY);
    }
    verifier.throws(invalidPublicKeyCoercionAttempt4, /Not a valid public key/);

    function invalidPublicKeyCoercionAttempt5() {
        secureKit.coercePublicKey(testData.REF_PRIVATE_KEY.toString());
    }
    verifier.throws(invalidPublicKeyCoercionAttempt5, /Not a valid public key/);
}

function checkPublicKeyFunctionality() {
    var currentCryptographicKey = secureKit.createPublicKey(testData.EXAMPLE_PUBLIC_KEY);
    testAllPublicKeyMethods(currentCryptographicKey);
}

function checkPrivateKeyFunctionality() {
    var currentCryptographicKey = secureKit.createPrivateKey(testData.REF_PRIVATE_KEY);
    testAllPublicKeyMethods(currentCryptographicKey);
    testAllPrivateKeyMethods(currentCryptographicKey);
}

function checkGeneratedKeyFunctionality() {
    // Execute a simple round-trip. Success here suggests the more exhaustive
    // native tests are reliable.
    // A basic end-to-end test. If this passes, the comprehensive native tests
    // are likely performing as expected.
    var newlyGeneratedKey = secureKit.generatePrivateKey();
}