"use strict";

const veri = require("assert");

const dataSrc = require("./fixture");
const cryptLib = dataSrc.ursa;

function checkStrEq(firstInput, secondInput, diagnosticMsg) {
    const normalizedFirst = firstInput.split("\r\n").join("\n");
    const normalizedSecond = secondInput.split("\r\n").join("\n");
    veri.equal(normalizedFirst, normalizedSecond, diagnosticMsg);
}

const ENCODING_HEX_VAL = dataSrc.HEX;
const ENCODING_BASE64_VAL = dataSrc.BASE64;
const ENCODING_BINARY_VAL = dataSrc.BINARY;
const ENCODING_UTF8_VAL = dataSrc.UTF8;

const EXPONENT_HEX_VALUE = dataSrc.EXPONENT_HEX;
const MODULUS_HEX_VALUE = dataSrc.MODULUS_HEX;

const PUBLIC_KEY_RAW_DATA = dataSrc.PUBLIC_KEY;
const PRIVATE_KEY_RAW_DATA = dataSrc.PRIVATE_KEY;
const SSH_PUBLIC_KEY_RAW_DATA = dataSrc.SSH_PUBLIC_KEY;
const SSH_PUBLIC_KEY_FINGERPRINT_HEX_VALUE = dataSrc.SSH_PUBLIC_KEY_FINGERPRINT_HEX;

const PLAINTEXT_SOURCE_DATA = dataSrc.PLAINTEXT;
const PLAINTEXT_PADDED_SOURCE_DATA = dataSrc.PLAINTEXT_PADDED;
const PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA = dataSrc.PUBLIC_CIPHERTEXT_HEX;
const PUBLIC_CIPHERTEXT_NP_HEX_SOURCE_DATA = dataSrc.PUBLIC_CIPHERTEXT_NP_HEX;
const PRIVATE_CIPHERTEXT_HEX_SOURCE_DATA = dataSrc.PRIVATE_CIPHERTEXT_HEX;

const SHA256_ALGORITHM_NAME = dataSrc.SHA256;
const SHA1_ALGORITHM_NAME = dataSrc.SHA1;
const PLAINTEXT_SHA256_HASH_SOURCE_DATA = dataSrc.PLAINTEXT_SHA256;
const PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA = dataSrc.PLAINTEXT_SHA256_SIGNATURE;

const PSS_MODULUS_HEX_SOURCE_DATA = dataSrc.PSS_MODULUS_HEX;
const PSS_MESSAGE_HEX_SOURCE_DATA = dataSrc.PSS_M_HEX;
const PSS_SIGNATURE_HEX_SOURCE_DATA = dataSrc.PSS_S_HEX;
const PSS_PUBLIC_KEY_RAW_DATA = dataSrc.PSS_PUBLIC_KEY;

const PRIVATE_KEY_THREE_RAW_DATA = dataSrc.PRIVATE_KEY_3;
const PRIVATE_KEY_COMPONENT_OBJECT = dataSrc.PRIVATE_KEY_COMPONENTS;

const AUTHENTICATION_PASSWORD = dataSrc.PASSWORD;
const DES_EDE3_CBC_CRYPTO = dataSrc.DES_EDE3_CBC;
const PASSWORD_PROTECTED_PRIVATE_KEY_RAW_DATA = dataSrc.PASS_PRIVATE_KEY;

const RSA_NO_PADDING_MODE = cryptLib.RSA_NO_PADDING;
const RSA_PKCS1_SALT_LEN_HASH_LENGTH = cryptLib.RSA_PKCS1_SALT_LEN_HLEN;
const RSA_PKCS1_SALT_LEN_MAX_LENGTH = cryptLib.RSA_PKCS1_SALT_LEN_MAX;

function verifyThrows(actionFunction, expectedErrorRegex, msgForFailure) {
    let exceptionCaught = false;
    try {
        actionFunction();
    } catch (err) {
        exceptionCaught = true;
        veri.ok(err instanceof Error && expectedErrorRegex.test(err.message), `Expected error to match pattern, but got: ${err.message}`);
    }
    veri.ok(exceptionCaught, msgForFailure || `Function was expected to throw, but did not.`);
}

function runPublicKeyMethodChecks(keyComponent) {
    let tempBufferStorage;
    let operationOutput;

    tempBufferStorage = keyComponent.getExponent();
    veri.equal(tempBufferStorage.toString(ENCODING_HEX_VAL), EXPONENT_HEX_VALUE, "Exponent hex buffer mismatch");
    operationOutput = keyComponent.getExponent(ENCODING_HEX_VAL);
    veri.equal(operationOutput, EXPONENT_HEX_VALUE, "Exponent hex string mismatch");
    operationOutput = keyComponent.getExponent(ENCODING_BASE64_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_BASE64_VAL), "Exponent base64 mismatch");
    operationOutput = keyComponent.getExponent(ENCODING_BINARY_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_BINARY_VAL), "Exponent binary mismatch");
    operationOutput = keyComponent.getExponent(ENCODING_UTF8_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_UTF8_VAL), "Exponent utf8 mismatch");

    tempBufferStorage = keyComponent.getModulus();
    veri.equal(tempBufferStorage.toString(ENCODING_HEX_VAL), MODULUS_HEX_VALUE, "Modulus hex buffer mismatch");
    operationOutput = keyComponent.getModulus(ENCODING_HEX_VAL);
    veri.equal(operationOutput, MODULUS_HEX_VALUE, "Modulus hex string mismatch");
    operationOutput = keyComponent.getModulus(ENCODING_BASE64_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_BASE64_VAL), "Modulus base64 mismatch");
    operationOutput = keyComponent.getModulus(ENCODING_BINARY_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_BINARY_VAL), "Modulus binary mismatch");
    operationOutput = keyComponent.getModulus(ENCODING_UTF8_VAL);
    veri.equal(operationOutput, tempBufferStorage.toString(ENCODING_UTF8_VAL), "Modulus utf8 mismatch");

    const expectedPublicPemResult = PUBLIC_KEY_RAW_DATA.toString(ENCODING_UTF8_VAL);
    let actualPublicPemResult = keyComponent.toPublicPem().toString(ENCODING_UTF8_VAL);
    checkStrEq(actualPublicPemResult, expectedPublicPemResult, "Public PEM buffer mismatch");
    actualPublicPemResult = keyComponent.toPublicPem(ENCODING_UTF8_VAL);
    checkStrEq(actualPublicPemResult, expectedPublicPemResult, "Public PEM string mismatch");

    const expectedPublicSshResult = SSH_PUBLIC_KEY_RAW_DATA.toString(ENCODING_BASE64_VAL);
    let actualPublicSshResult = keyComponent.toPublicSsh().toString(ENCODING_BASE64_VAL);
    veri.equal(actualPublicSshResult, expectedPublicSshResult, "Public SSH buffer mismatch");
    actualPublicSshResult = keyComponent.toPublicSsh(ENCODING_BASE64_VAL);
    veri.equal(actualPublicSshResult, expectedPublicSshResult, "Public SSH string mismatch");

    let actualFingerprintResult = keyComponent.toPublicSshFingerprint().toString(ENCODING_HEX_VAL);
    veri.equal(actualFingerprintResult, SSH_PUBLIC_KEY_FINGERPRINT_HEX_VALUE, "Public SSH Fingerprint buffer mismatch");
    actualFingerprintResult = keyComponent.toPublicSshFingerprint(ENCODING_HEX_VAL);
    veri.equal(actualFingerprintResult, SSH_PUBLIC_KEY_FINGERPRINT_HEX_VALUE, "Public SSH Fingerprint string mismatch");

    const decryptionPrivKey = cryptLib.createPrivateKey(PRIVATE_KEY_RAW_DATA);
    let encryptedContent = keyComponent.encrypt(Buffer.from(PLAINTEXT_SOURCE_DATA, ENCODING_UTF8_VAL));
    let decryptedContent = decryptionPrivKey.decrypt(encryptedContent, undefined, ENCODING_UTF8_VAL);
    veri.equal(decryptedContent, PLAINTEXT_SOURCE_DATA, "Encryption/Decryption round trip (buffer) failed");

    encryptedContent = keyComponent.encrypt(PLAINTEXT_SOURCE_DATA, ENCODING_UTF8_VAL, ENCODING_BASE64_VAL);
    decryptedContent = decryptionPrivKey.decrypt(encryptedContent, ENCODING_BASE64_VAL, ENCODING_UTF8_VAL);
    veri.equal(decryptedContent, PLAINTEXT_SOURCE_DATA, "Encryption/Decryption round trip (UTF8/B64) failed");

    encryptedContent = keyComponent.encrypt(PLAINTEXT_SOURCE_DATA, undefined, ENCODING_HEX_VAL);
    decryptedContent = decryptionPrivKey.decrypt(encryptedContent, ENCODING_HEX_VAL, ENCODING_UTF8_VAL);
    veri.equal(decryptedContent, PLAINTEXT_SOURCE_DATA, "Encryption/Decryption round trip (undefined/HEX) failed");

    let encodedForPublicDecryption = Buffer.from(PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, ENCODING_HEX_VAL);
    let decodedFromPublicDecryption = keyComponent.publicDecrypt(encodedForPublicDecryption).toString(ENCODING_UTF8_VAL);
    veri.equal(decodedFromPublicDecryption, PLAINTEXT_SOURCE_DATA, "Public Decrypt (buffer) failed");

    decodedFromPublicDecryption = keyComponent.publicDecrypt(PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, ENCODING_HEX_VAL, ENCODING_UTF8_VAL);
    veri.equal(decodedFromPublicDecryption, PLAINTEXT_SOURCE_DATA, "Public Decrypt (string/HEX/UTF8) failed");

    decodedFromPublicDecryption = keyComponent.publicDecrypt(PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, ENCODING_HEX_VAL, ENCODING_UTF8_VAL, RSA_NO_PADDING_MODE);
    veri.equal(decodedFromPublicDecryption, PLAINTEXT_PADDED_SOURCE_DATA, "Public Decrypt (string/HEX/UTF8/NoPadding) failed");

    veri.equal(keyComponent.verify(SHA256_ALGORITHM_NAME, PLAINTEXT_SHA256_HASH_SOURCE_DATA,
        PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA, ENCODING_HEX_VAL), true, "Signature verification (string) failed");

    const hashBufferForVerification = Buffer.from(PLAINTEXT_SHA256_HASH_SOURCE_DATA, ENCODING_HEX_VAL);
    const signatureBufferForVerification = Buffer.from(PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA, ENCODING_HEX_VAL);
    veri.equal(keyComponent.verify(SHA256_ALGORITHM_NAME, hashBufferForVerification, signatureBufferForVerification), true, "Signature verification (buffer) failed");

    veri.equal(keyComponent.hashAndVerify(SHA256_ALGORITHM_NAME,
        Buffer.from(PLAINTEXT_SOURCE_DATA, ENCODING_UTF8_VAL),
        PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA,
        ENCODING_HEX_VAL), true, "Hash and Verify (string) failed");

    const auxiliaryKey = cryptLib.createPublicKeyFromComponents(
        Buffer.from(PSS_MODULUS_HEX_SOURCE_DATA, ENCODING_HEX_VAL),
        Buffer.from(EXPONENT_HEX_VALUE, ENCODING_HEX_VAL));

    veri.equal(auxiliaryKey.hashAndVerify(SHA1_ALGORITHM_NAME,
        PSS_MESSAGE_HEX_SOURCE_DATA,
        PSS_SIGNATURE_HEX_SOURCE_DATA,
        ENCODING_HEX_VAL,
        true,
        RSA_PKCS1_SALT_LEN_HASH_LENGTH), true, "PSS Hash and Verify (HLEN) failed");

    veri.equal(auxiliaryKey.hashAndVerify(SHA1_ALGORITHM_NAME,
        PSS_MESSAGE_HEX_SOURCE_DATA,
        PSS_SIGNATURE_HEX_SOURCE_DATA,
        ENCODING_HEX_VAL,
        true), true, "PSS Hash and Verify (default HLEN) failed");
}

function runPrivateKeyMethodChecks(keyComponent) {
    const expectedPrivatePemResult = PRIVATE_KEY_RAW_DATA.toString(ENCODING_UTF8_VAL);
    let actualPrivatePemResult = keyComponent.toPrivatePem().toString(ENCODING_UTF8_VAL);
    checkStrEq(actualPrivatePemResult, expectedPrivatePemResult, "Private PEM buffer mismatch");
    actualPrivatePemResult = keyComponent.toPrivatePem(ENCODING_UTF8_VAL);
    checkStrEq(actualPrivatePemResult, expectedPrivatePemResult, "Private PEM string mismatch");

    const passwordForEncryption = AUTHENTICATION_PASSWORD.toString(ENCODING_UTF8_VAL);
    const encryptionAlgorithm = DES_EDE3_CBC_CRYPTO;

    let encryptedPemOutput = keyComponent.toEncryptedPrivatePem(passwordForEncryption, encryptionAlgorithm).toString(ENCODING_UTF8_VAL);
    let decryptedKeyFromPem = cryptLib.createPrivateKey(encryptedPemOutput, passwordForEncryption);
    checkStrEq(decryptedKeyFromPem.toPrivatePem().toString(), PRIVATE_KEY_RAW_DATA.toString(), "Encrypted Private PEM (buffer) round trip failed");

    encryptedPemOutput = keyComponent.toEncryptedPrivatePem(passwordForEncryption, encryptionAlgorithm, ENCODING_UTF8_VAL).toString(ENCODING_UTF8_VAL);
    decryptedKeyFromPem = cryptLib.createPrivateKey(encryptedPemOutput, passwordForEncryption);
    checkStrEq(decryptedKeyFromPem.toPrivatePem().toString(), PRIVATE_KEY_RAW_DATA.toString(), "Encrypted Private PEM (string) round trip failed");

    let encodedForDecryption = Buffer.from(PRIVATE_CIPHERTEXT_HEX_SOURCE_DATA, ENCODING_HEX_VAL);
    let decodedFromDecryption = keyComponent.decrypt(encodedForDecryption).toString(ENCODING_UTF8_VAL);
    veri.equal(decodedFromDecryption, PLAINTEXT_SOURCE_DATA, "Decryption (buffer) failed");

    decodedFromDecryption = keyComponent.decrypt(PRIVATE_CIPHERTEXT_HEX_SOURCE_DATA, ENCODING_HEX_VAL, ENCODING_UTF8_VAL);
    veri.equal(decodedFromDecryption, PLAINTEXT_SOURCE_DATA, "Decryption (string/HEX/UTF8) failed");

    let encryptedByPrivateProcess = keyComponent.privateEncrypt(
        Buffer.from(PLAINTEXT_SOURCE_DATA, ENCODING_UTF8_VAL)).toString(ENCODING_HEX_VAL);
    veri.equal(encryptedByPrivateProcess, PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, "Private Encrypt (buffer) failed");

    encryptedByPrivateProcess = keyComponent.privateEncrypt(PLAINTEXT_SOURCE_DATA, ENCODING_UTF8_VAL, ENCODING_HEX_VAL);
    veri.equal(encryptedByPrivateProcess, PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, "Private Encrypt (string/UTF8/HEX) failed");

    encryptedByPrivateProcess = keyComponent.privateEncrypt(PLAINTEXT_SOURCE_DATA, undefined, ENCODING_HEX_VAL);
    veri.equal(encryptedByPrivateProcess, PUBLIC_CIPHERTEXT_HEX_SOURCE_DATA, "Private Encrypt (string/undefined/HEX) failed");

    encryptedByPrivateProcess = keyComponent.privateEncrypt(PLAINTEXT_PADDED_SOURCE_DATA, ENCODING_UTF8_VAL, ENCODING_HEX_VAL, RSA_NO_PADDING_MODE);
    veri.equal(encryptedByPrivateProcess, PUBLIC_CIPHERTEXT_NP_HEX_SOURCE_DATA, "Private Encrypt (padded) failed");

    let generatedSignatureOutput = keyComponent.sign(SHA256_ALGORITHM_NAME,
        PLAINTEXT_SHA256_HASH_SOURCE_DATA, ENCODING_HEX_VAL,
        ENCODING_BASE64_VAL);
    generatedSignatureOutput = Buffer.from(generatedSignatureOutput, ENCODING_BASE64_VAL);
    veri.equal(generatedSignatureOutput.toString(ENCODING_HEX_VAL), PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA, "Signing (string/HEX/B64) failed");

    const bufferForSigningOperation = Buffer.from(PLAINTEXT_SHA256_HASH_SOURCE_DATA, ENCODING_HEX_VAL);
    generatedSignatureOutput = keyComponent.sign(SHA256_ALGORITHM_NAME, bufferForSigningOperation, undefined, ENCODING_HEX_VAL);
    veri.equal(generatedSignatureOutput, PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA, "Signing (buffer/undefined/HEX) failed");

    let hashAndSignOutput = keyComponent.hashAndSign(SHA256_ALGORITHM_NAME, PLAINTEXT_SOURCE_DATA,
        ENCODING_UTF8_VAL, ENCODING_HEX_VAL);
    veri.equal(hashAndSignOutput, PLAINTEXT_SHA256_SIGNATURE_SOURCE_DATA, "Hash and Sign (string/UTF8/HEX) failed");

    hashAndSignOutput = keyComponent.hashAndSign(SHA256_ALGORITHM_NAME, PLAINTEXT_SOURCE_DATA,
        ENCODING_UTF8_VAL, ENCODING_HEX_VAL,
        true, RSA_PKCS1_SALT_LEN_MAX_LENGTH);

    veri.equal(keyComponent.hashAndVerify(
        SHA256_ALGORITHM_NAME,
        Buffer.from(PLAINTEXT_SOURCE_DATA).toString(ENCODING_HEX_VAL),
        hashAndSignOutput,
        ENCODING_HEX_VAL,
        true,
        RSA_PKCS1_SALT_LEN_MAX_LENGTH), true, "Hash and Sign (PSS Max Salt) verification failed");
}

function processCoreCryptoOperations() {
    cryptLib.createPublicKey(PUBLIC_KEY_RAW_DATA);
    cryptLib.createPrivateKey(PRIVATE_KEY_RAW_DATA);
    cryptLib.createPrivateKey(PASSWORD_PROTECTED_PRIVATE_KEY_RAW_DATA, AUTHENTICATION_PASSWORD);
    cryptLib.generatePrivateKey(512);

    cryptLib.createPublicKey(PUBLIC_KEY_RAW_DATA.toString(ENCODING_UTF8_VAL));
    cryptLib.createPrivateKey(PRIVATE_KEY_RAW_DATA.toString(ENCODING_BASE64_VAL),
        undefined, ENCODING_BASE64_VAL);
}

function evaluateKeyTypeCategorization() {
    const publicObject = cryptLib.createPublicKey(PUBLIC_KEY_RAW_DATA);
    const privateObject = cryptLib.createPrivateKey(PRIVATE_KEY_RAW_DATA);
    let messageIdentifier;

    messageIdentifier = "Verification of isKey()";
    veri.equal(cryptLib.isKey(publicObject), true, messageIdentifier);
    veri.equal(cryptLib.isKey(privateObject), true, messageIdentifier);
    veri.equal(cryptLib.isKey(undefined), false, messageIdentifier);
    veri.equal(cryptLib.isKey("x"), false, messageIdentifier);

    messageIdentifier = "Verification of isPublicKey()";
    veri.equal(cryptLib.isPublicKey(publicObject), true, messageIdentifier);
    veri.equal(cryptLib.isPublicKey(privateObject), false, messageIdentifier);
    veri.equal(cryptLib.isPublicKey(undefined), false, messageIdentifier);
    veri.equal(cryptLib.isPublicKey("x"), false, messageIdentifier);

    messageIdentifier = "Verification of isPrivateKey()";
    veri.equal(cryptLib.isPrivateKey(publicObject), false, messageIdentifier);
    veri.equal(cryptLib.isPrivateKey(privateObject), true, messageIdentifier);
    veri.equal(cryptLib.isPrivateKey(undefined), false, messageIdentifier);
    veri.equal(cryptLib.isPrivateKey("x"), false, messageIdentifier);

    veri.doesNotThrow(() => { cryptLib.assertKey(publicObject); }, "assertKey on public key should not throw");
    veri.doesNotThrow(() => { cryptLib.assertKey(privateObject); }, "assertKey on private key should not throw");
    verifyThrows(() => { cryptLib.assertKey(undefined); }, /Not a key/, "assertKey on undefined should throw");
    verifyThrows(() => { cryptLib.assertKey("x"); }, /Not a key/, "assertKey on string should throw");

    veri.doesNotThrow(() => { cryptLib.assertPublicKey(publicObject); }, "assertPublicKey on public key should not throw");
    verifyThrows(() => { cryptLib.assertPublicKey(privateObject); }, /Not a public key/, "assertPublicKey on private key should throw");
    verifyThrows(() => { cryptLib.assertPublicKey(undefined); }, /Not a public key/, "assertPublicKey on undefined should throw");
    verifyThrows(() => { cryptLib.assertPublicKey("x"); }, /Not a public key/, "assertPublicKey on string should throw");

    verifyThrows(() => { cryptLib.assertPrivateKey(publicObject); }, /Not a private key/, "assertPrivateKey on public key should throw");
    veri.doesNotThrow(() => { cryptLib.assertPrivateKey(privateObject); }, "assertPrivateKey on private key should not throw");
    verifyThrows(() => { cryptLib.assertPrivateKey(undefined); }, /Not a private key/, "assertPrivateKey on undefined should throw");
    verifyThrows(() => { cryptLib.assertPrivateKey("x"); }, /Not a private key/, "assertPrivateKey on string should throw");
}

function verifyGenericKeyCreation() {
    const generatedPrivate = cryptLib.createKey(PRIVATE_KEY_RAW_DATA);
    veri.ok(cryptLib.isPrivateKey(generatedPrivate), "createKey should yield private key for private data");

    const generatedPublic = cryptLib.createKey(PUBLIC_KEY_RAW_DATA);
    veri.ok(cryptLib.isPublicKey(generatedPublic), "createKey should yield public key for public data");

    verifyThrows(() => {
        cryptLib.createKey("malformed key data");
    }, /Not a key\./, "createKey with invalid data should throw");
}

function verifyPrivateKeyFromPartsConstruction() {
    const privateFromComponents = cryptLib.createPrivateKeyFromComponents(
        PRIVATE_KEY_COMPONENT_OBJECT.modulus,
        PRIVATE_KEY_COMPONENT_OBJECT.exponent,
        PRIVATE_KEY_COMPONENT_OBJECT.p,
        PRIVATE_KEY_COMPONENT_OBJECT.q,
        PRIVATE_KEY_COMPONENT_OBJECT.dp,
        PRIVATE_KEY_COMPONENT_OBJECT.dq,
        PRIVATE_KEY_COMPONENT_OBJECT.inverseQ,
        PRIVATE_KEY_COMPONENT_OBJECT.d);

    veri.ok(cryptLib.isPrivateKey(privateFromComponents), "Key from components must be private");

    const privateFromDirectPem = cryptLib.createPrivateKey(PRIVATE_KEY_THREE_RAW_DATA);
    veri.equal(privateFromComponents.toPrivatePem(ENCODING_UTF8_VAL), privateFromDirectPem.toPrivatePem(ENCODING_UTF8_VAL), "Private key from components should match PEM key");
}

function verifyPublicKeyFromPartsConstruction() {
    const publicFromComponents = cryptLib.createPublicKeyFromComponents(
        Buffer.from(PSS_MODULUS_HEX_SOURCE_DATA, ENCODING_HEX_VAL),
        Buffer.from(EXPONENT_HEX_VALUE, ENCODING_HEX_VAL));

    veri.ok(cryptLib.isPublicKey(publicFromComponents), "Key from components must be public");

    const publicFromDirectPem = cryptLib.createPublicKey(PSS_PUBLIC_KEY_RAW_DATA);
    veri.equal(publicFromComponents.toPublicPem(ENCODING_UTF8_VAL), publicFromDirectPem.toPublicPem(ENCODING_UTF8_VAL), "Public key from components should match PEM key");
}

function verifyPublicCreationInvalidInput() {
    verifyThrows(() => {
        cryptLib.createPublicKey(PRIVATE_KEY_RAW_DATA);
    }, /Not a public key\./, "Creating public key from private data should fail");
}

function verifyPrivateCreationInvalidInput() {
    verifyThrows(() => {
        cryptLib.createPrivateKey(PUBLIC_KEY_RAW_DATA);
    }, /Not a private key\./, "Creating private key from public data should fail");
}

function verifyKeyAdaptation() {
    let adaptedPrivateKey = cryptLib.coerceKey(PRIVATE_KEY_RAW_DATA);
    veri.ok(cryptLib.isPrivateKey(adaptedPrivateKey), "Coerced private key (buffer) should be private");

    adaptedPrivateKey = cryptLib.coerceKey(PRIVATE_KEY_RAW_DATA.toString());
    veri.ok(cryptLib.isPrivateKey(adaptedPrivateKey), "Coerced private key (string) should be private");

    let adaptedPublicKey = cryptLib.coerceKey(PUBLIC_KEY_RAW_DATA);
    veri.ok(cryptLib.isPublicKey(adaptedPublicKey), "Coerced public key (buffer) should be public");

    adaptedPublicKey = cryptLib.coerceKey(PUBLIC_KEY_RAW_DATA.toString());
    veri.ok(cryptLib.isPublicKey(adaptedPublicKey), "Coerced public key (string) should be public");

    veri.equal(cryptLib.coerceKey(adaptedPrivateKey), adaptedPrivateKey, "Coercing an existing key object should return itself");
    veri.equal(cryptLib.coerceKey(adaptedPublicKey), adaptedPublicKey, "Coercing an existing key object should return itself");
}

function verifyPrivateKeyAdaptation() {
    let adaptedPrivateKey = cryptLib.coercePrivateKey(PRIVATE_KEY_RAW_DATA);
    veri.ok(cryptLib.isPrivateKey(adaptedPrivateKey), "Coerced private key (buffer) should be private");

    adaptedPrivateKey = cryptLib.coercePrivateKey(PRIVATE_KEY_RAW_DATA.toString());
    veri.ok(cryptLib.isPrivateKey(adaptedPrivateKey), "Coerced private key (string) should be private");

    veri.equal(cryptLib.coercePrivateKey(adaptedPrivateKey), adaptedPrivateKey, "Coercing an existing private key object should return itself");
}

function verifyPublicKeyAdaptation() {
    let adaptedPublicKey = cryptLib.coercePublicKey(PUBLIC_KEY_RAW_DATA);
    veri.ok(cryptLib.isPublicKey(adaptedPublicKey), "Coerced public key (buffer) should be public");

    adaptedPublicKey = cryptLib.coercePublicKey(PUBLIC_KEY_RAW_DATA.toString());
    veri.ok(cryptLib.isPublicKey(adaptedPublicKey), "Coerced public key (string) should be public");

    veri.equal(cryptLib.coercePublicKey(adaptedPublicKey), adaptedPublicKey, "Coercing an existing public key object should return itself");
}

function verifyKeyAdaptationFailures() {
    verifyThrows(() => { cryptLib.coerceKey("random string data"); }, /Not a key/, "coerceKey on bad string should throw");
    verifyThrows(() => { cryptLib.coerceKey(Buffer.from([0xAA, 0xBB, 0xCC])); }, /Not a key/, "coerceKey on random buffer should throw");
    verifyThrows(() => { cryptLib.coerceKey([]); }, /Not a key/, "coerceKey on empty array should throw");
}

function verifyPrivateKeyAdaptationFailures() {
    verifyThrows(() => { cryptLib.coercePrivateKey("random string data"); }, /Not a private key/, "coercePrivateKey on bad string should throw");
    verifyThrows(() => { cryptLib.coercePrivateKey(Buffer.from([0x11, 0x22])); }, /Not a private key/, "coercePrivateKey on random buffer should throw");
    verifyThrows(() => { cryptLib.coercePrivateKey([]); }, /Not a private key/, "coercePrivateKey on empty array should throw");
    verifyThrows(() => { cryptLib.coercePrivateKey(PUBLIC_KEY_RAW_DATA); }, /Not a private key/, "coercePrivateKey on public key buffer should throw");
    verifyThrows(() => { cryptLib.coercePrivateKey(PUBLIC_KEY_RAW_DATA.toString()); }, /Not a private key/, "coercePrivateKey on public key string should throw");
}

function verifyPublicKeyAdaptationFailures() {
    verifyThrows(() => { cryptLib.coercePublicKey("random string data"); }, /Not a public key/, "coercePublicKey on bad string should throw");
    verifyThrows(() => { cryptLib.coercePublicKey(Buffer.from([0x33, 0x44])); }, /Not a public key/, "coercePublicKey on random buffer should throw");
    verifyThrows(() => { cryptLib.coercePublicKey([]); }, /Not a public key/, "coercePublicKey on empty array should throw");
    verifyThrows(() => { cryptLib.coercePublicKey(PRIVATE_KEY_RAW_DATA); }, /Not a public key/, "coercePublicKey on private key buffer should throw");
    verifyThrows(() => { cryptLib.coercePublicKey(PRIVATE_KEY_RAW_DATA.toString()); }, /Not a public key/, "coercePublicKey on private key string should throw");
}

function verifyPublicKeyBehavior() {
    const publicCryptoEntity = cryptLib.createPublicKey(PUBLIC_KEY_RAW_DATA);
    runPublicKeyMethodChecks(publicCryptoEntity);
}

function verifyPrivateKeyBehavior() {
    const privateCryptoEntity = cryptLib.createPrivateKey(PRIVATE_KEY_RAW_DATA);
    runPublicKeyMethodChecks(privateCryptoEntity);
    runPrivateKeyMethodChecks(privateCryptoEntity);
}

function verifyGeneratedKeyBehavior() {
    const newlyCreatedKey = cryptLib.generatePrivateKey();
    const originalMessage = Buffer.from("a short message for testing");
    const encryptedMessage = newlyCreatedKey.encrypt(originalMessage);
    const decryptedMessage = newlyCreatedKey.decrypt(encryptedMessage);
    veri.equal(decryptedMessage.toString(), originalMessage.toString(), "Generated key encrypt/decrypt failed");
}

processCoreCryptoOperations();
evaluateKeyTypeCategorization();
verifyGenericKeyCreation();
verifyPrivateKeyFromPartsConstruction();
verifyPublicKeyFromPartsConstruction();
verifyPublicCreationInvalidInput();
verifyPrivateCreationInvalidInput();
verifyKeyAdaptation();
verifyPrivateKeyAdaptation();
verifyPublicKeyAdaptation();
verifyKeyAdaptationFailures();
verifyPrivateKeyAdaptationFailures();
verifyPublicKeyAdaptationFailures();
verifyPublicKeyBehavior();
verifyPrivateKeyBehavior();
verifyGeneratedKeyBehavior();