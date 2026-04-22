/*
 * Copyright 2012 Obvious Solutions Inc.
 *
 * This file contains comprehensive validation routines for the secureTool cryptographic library.
 * It ensures the correct behavior of key management, encryption, decryption, and signing operations.
 */

"use strict";

const check = require("assert");

const cryptoAssets = require("./fixture");
const secureTool = cryptoAssets.ursa;

// Utility for creating buffers from various inputs.
const bufferHelper = {
  create: (input, encoding) => Buffer.from(input, encoding || 'utf8')
};

/**
 * Verifies that two string payloads are identical, normalizing Windows-style newlines.
 *
 * @param {string} currentData - The actual string received.
 * @param {string} expectedData - The anticipated string value.
 * @param {string} [contextMessage] - Optional message for assertion failure.
 */
function verifyContentEquivalence(currentData, expectedData, contextMessage) {
  if (typeof currentData !== 'string' || typeof expectedData !== 'string') {
    throw new TypeError('Inputs for content equivalence check must be strings.');
  }
  const normalizedCurrent = currentData.split('\r\n').join('\n');
  const normalizedExpected = expectedData.split('\r\n').join('\n');
  check.strictEqual(normalizedCurrent, normalizedExpected, contextMessage);
}

/*
 * Auxiliary validation routines for cryptographic operations
 */

/**
 * Validates the retrieval of the exponent from a given key object.
 * @param {object} rsaObject - The key object to test.
 */
function checkExponentRetrieval(rsaObject) {
  // Retrieve the raw exponent as a Buffer.
  const rawExponentBuffer = rsaObject.getExponent();
  check.strictEqual(rawExponentBuffer.toString(cryptoAssets.HEX_ENC), cryptoAssets.EXPONENT_HEX_VAL);

  // Test retrieval with various encodings.
  const hexResult = rsaObject.getExponent(cryptoAssets.HEX_ENC);
  check.strictEqual(hexResult, cryptoAssets.EXPONENT_HEX_VAL, 'Hex exponent mismatch');

  const base64Result = rsaObject.getExponent(cryptoAssets.BASE64_ENC);
  check.strictEqual(base64Result, rawExponentBuffer.toString(cryptoAssets.BASE64_ENC), 'Base64 exponent mismatch');

  const utf8Result = rsaObject.getExponent(cryptoAssets.UTF8_ENC);
  check.strictEqual(utf8Result, rawExponentBuffer.toString(cryptoAssets.UTF8_ENC), 'UTF8 exponent mismatch');
}

/**
 * Validates the retrieval of the modulus from a given key object.
 * @param {object} rsaObject - The key object to test.
 */
function checkModulusRetrieval(rsaObject) {
  const rawModulusBuffer = rsaObject.getModulus();
  check.strictEqual(rawModulusBuffer.toString(cryptoAssets.HEX_ENC), cryptoAssets.MODULUS_HEX_VAL);

  const hexModulus = rsaObject.getModulus(cryptoAssets.HEX_ENC);
  check.strictEqual(hexModulus, cryptoAssets.MODULUS_HEX_VAL, 'Hex modulus mismatch');

  const base64Modulus = rsaObject.getModulus(cryptoAssets.BASE64_ENC);
  check.strictEqual(base64Modulus, rawModulusBuffer.toString(cryptoAssets.BASE64_ENC), 'Base64 modulus mismatch');
}

/**
 * Verifies the export of a public key to PEM format.
 * @param {object} rsaObject - The public key object.
 */
function examinePublicPemExport(rsaObject) {
  const expectedPemContent = cryptoAssets.PUBLIC_KEY_PEM.toString(cryptoAssets.UTF8_ENC);

  const exportedPemBuffer = rsaObject.toPublicPem();
  verifyContentEquivalence(exportedPemBuffer.toString(cryptoAssets.UTF8_ENC), expectedPemContent, 'Default public PEM export mismatch');

  const exportedPemString = rsaObject.toPublicPem(cryptoAssets.UTF8_ENC);
  verifyContentEquivalence(exportedPemString, expectedPemContent, 'UTF8 public PEM export mismatch');
}

/**
 * Verifies the export of a public key to SSH format.
 * @param {object} rsaObject - The public key object.
 */
function confirmPublicSshExport(rsaObject) {
  const expectedSshKey = cryptoAssets.SSH_PUBLIC_KEY_STR.toString(cryptoAssets.BASE64_ENC);

  const sshKeyBuffer = rsaObject.toPublicSsh();
  check.strictEqual(sshKeyBuffer.toString(cryptoAssets.BASE64_ENC), expectedSshKey, 'Default public SSH export mismatch');

  const sshKeyString = rsaObject.toPublicSsh(cryptoAssets.BASE64_ENC);
  check.strictEqual(sshKeyString, expectedSshKey, 'Base64 public SSH export mismatch');
}

/**
 * Validates the generation of a public SSH key fingerprint.
 * @param {object} rsaObject - The public key object.
 */
function validatePublicSshFingerprint(rsaObject) {
  const fingerprintRaw = rsaObject.toPublicSshFingerprint();
  check.strictEqual(fingerprintRaw.toString(cryptoAssets.HEX_ENC), cryptoAssets.SSH_PUBLIC_KEY_FINGERPRINT_HEX_VAL, 'Default fingerprint mismatch');

  const fingerprintHex = rsaObject.toPublicSshFingerprint(cryptoAssets.HEX_ENC);
  check.strictEqual(fingerprintHex, cryptoAssets.SSH_PUBLIC_KEY_FINGERPRINT_HEX_VAL, 'Hex fingerprint mismatch');
}

/**
 * Tests the encryption functionality by performing a round-trip (encrypt then decrypt).
 * @param {object} publicKeyObject - The public key for encryption.
 */
function verifyEncryptionDecryptionCycle(publicKeyObject) {
  // Ensure basic string input is handled.
  const plainTextInput = cryptoAssets.MESSAGE_PLAINTEXT;
  const privateKeyInstance = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);

  let encryptedPayload = publicKeyObject.encrypt(bufferHelper.create(plainTextInput, cryptoAssets.UTF8_ENC));
  let decryptedPayload = privateKeyInstance.decrypt(encryptedPayload, undefined, cryptoAssets.UTF8_ENC);
  check.strictEqual(decryptedPayload, plainTextInput, 'Basic encryption/decryption failed');

  // Test with explicit input/output encodings.
  encryptedPayload = publicKeyObject.encrypt(plainTextInput, cryptoAssets.UTF8_ENC, cryptoAssets.BASE64_ENC);
  decryptedPayload = privateKeyInstance.decrypt(encryptedPayload, cryptoAssets.BASE64_ENC, cryptoAssets.UTF8_ENC);
  check.strictEqual(decryptedPayload, plainTextInput, 'Encoded encryption/decryption failed');

  // Test with undefined input encoding (defaults to utf8).
  encryptedPayload = publicKeyObject.encrypt(plainTextInput, undefined, cryptoAssets.HEX_ENC);
  decryptedPayload = privateKeyInstance.decrypt(encryptedPayload, cryptoAssets.HEX_ENC, cryptoAssets.UTF8_ENC);
  check.strictEqual(decryptedPayload, plainTextInput, 'Undefined input encoding encryption/decryption failed');
}

/**
 * Validates the public decryption functionality.
 * @param {object} publicKeyObject - The public key for decryption.
 */
function validatePublicDecryption(publicKeyObject) {
  const plaintext = cryptoAssets.MESSAGE_PLAINTEXT;
  const ciphertextHex = cryptoAssets.PUBLIC_CIPHERTEXT_HEX_VAL;
  const ciphertextNpHex = cryptoAssets.PUBLIC_CIPHERTEXT_NO_PADDING_HEX_VAL;
  const plaintextPadded = cryptoAssets.MESSAGE_PLAINTEXT_PADDED;

  // Decrypt from buffer input.
  const encodedBuf = bufferHelper.create(ciphertextHex, cryptoAssets.HEX_ENC);
  const decodedBufResult = publicKeyObject.publicDecrypt(encodedBuf).toString(cryptoAssets.UTF8_ENC);
  check.strictEqual(decodedBufResult, plaintext, 'Public decryption from buffer failed');

  // Decrypt from string input with explicit encodings.
  const decodedStringResult = publicKeyObject.publicDecrypt(ciphertextHex, cryptoAssets.HEX_ENC, cryptoAssets.UTF8_ENC);
  check.strictEqual(decodedStringResult, plaintext, 'Public decryption from string failed');

  // Decrypt with no padding.
  const decodedNoPaddingResult = publicKeyObject.publicDecrypt(ciphertextNpHex, cryptoAssets.HEX_ENC, cryptoAssets.UTF8_ENC, secureTool.RSA_NO_PADDING);
  check.strictEqual(decodedNoPaddingResult, plaintextPadded, 'Public decryption with no padding failed');
}

/**
 * Confirms the digital signature verification process.
 * @param {object} publicKeyObject - The public key for verification.
 */
function confirmSignatureVerification(publicKeyObject) {
  const hashAlgorithm = cryptoAssets.SHA256_ALG;
  const dataHash = cryptoAssets.PLAINTEXT_SHA256_HASH;
  const signature = cryptoAssets.PLAINTEXT_SHA256_SIGNATURE;

  // Verify with string inputs.
  const verificationResult1 = publicKeyObject.verify(hashAlgorithm, dataHash, signature, cryptoAssets.HEX_ENC);
  check.ok(verificationResult1, 'Verification with string inputs failed');

  // Verify with buffer inputs.
  const hashBuffer = bufferHelper.create(dataHash, cryptoAssets.HEX_ENC);
  const signatureBuffer = bufferHelper.create(signature, cryptoAssets.HEX_ENC);
  const verificationResult2 = publicKeyObject.verify(hashAlgorithm, hashBuffer, signatureBuffer);
  check.ok(verificationResult2, 'Verification with buffer inputs failed');
}

/**
 * Assesses the hash-and-verify functionality, including PSS.
 * @param {object} publicKeyObject - The public key for verification.
 */
function assessHashedSignatureVerification(publicKeyObject) {
  const alg = cryptoAssets.SHA256_ALG;
  const messageBuffer = bufferHelper.create(cryptoAssets.MESSAGE_PLAINTEXT, cryptoAssets.UTF8_ENC);
  const expectedSignature = cryptoAssets.PLAINTEXT_SHA256_SIGNATURE;

  const standardVerification = publicKeyObject.hashAndVerify(alg, messageBuffer, expectedSignature, cryptoAssets.HEX_ENC);
  check.ok(standardVerification, 'Standard hash-and-verify failed');

  // Test PSS verification with a different key.
  const pssPublicKey = secureTool.createPublicKeyFromComponents(
    bufferHelper.create(cryptoAssets.PSS_MODULUS_HEX_VAL, cryptoAssets.HEX_ENC),
    bufferHelper.create(cryptoAssets.EXPONENT_HEX_VAL, cryptoAssets.HEX_ENC)
  );

  const pssMessageHex = cryptoAssets.PSS_MESSAGE_HEX_VAL;
  const pssSignatureHex = cryptoAssets.PSS_SIGNATURE_HEX_VAL;
  const pssSaltLenHlen = secureTool.RSA_PKCS1_SALT_LEN_HLEN;

  const pssVerificationHlen = pssPublicKey.hashAndVerify(
    cryptoAssets.SHA1_ALG, pssMessageHex, pssSignatureHex, cryptoAssets.HEX_ENC, true, pssSaltLenHlen
  );
  check.ok(pssVerificationHlen, 'PSS hash-and-verify with HLEN salt length failed');

  const pssVerificationDefaultSalt = pssPublicKey.hashAndVerify(
    cryptoAssets.SHA1_ALG, pssMessageHex, pssSignatureHex, cryptoAssets.HEX_ENC, true
  );
  check.ok(pssVerificationDefaultSalt, 'PSS hash-and-verify with default salt length failed');
}

/**
 * Grouped tests for public key functionality.
 * @param {object} keyInstance - The public key object to test.
 */
function executePublicKeyValidations(keyInstance) {
  checkExponentRetrieval(keyInstance);
  checkModulusRetrieval(keyInstance);
  examinePublicPemExport(keyInstance);
  confirmPublicSshExport(keyInstance);
  validatePublicSshFingerprint(keyInstance);
  verifyEncryptionDecryptionCycle(keyInstance);
  validatePublicDecryption(keyInstance);
  confirmSignatureVerification(keyInstance);
  assessHashedSignatureVerification(keyInstance);
}

/**
 * Verifies the export of a private key to PEM format.
 * @param {object} rsaObject - The private key object.
 */
function examinePrivatePemExport(rsaObject) {
  const expectedPemContent = cryptoAssets.PRIVATE_KEY_PEM.toString(cryptoAssets.UTF8_ENC);

  const exportedPemBuffer = rsaObject.toPrivatePem();
  verifyContentEquivalence(exportedPemBuffer.toString(cryptoAssets.UTF8_ENC), expectedPemContent, 'Default private PEM export mismatch');

  const exportedPemString = rsaObject.toPrivatePem(cryptoAssets.UTF8_ENC);
  verifyContentEquivalence(exportedPemString, expectedPemContent, 'UTF8 private PEM export mismatch');
}

/**
 * Validates the export of an encrypted private key to PEM format.
 * @param {object} rsaObject - The private key object.
 */
function assessEncryptedPrivatePemExport(rsaObject) {
  const keyPassword = cryptoAssets.PASSWORD_STR.toString(cryptoAssets.UTF8_ENC);
  const cipherMethod = cryptoAssets.DES_EDE3_CBC_CIPHER;

  // Export encrypted PEM.
  const encryptedPemBuffer = rsaObject.toEncryptedPrivatePem(keyPassword, cipherMethod);
  const encryptedPemString = encryptedPemBuffer.toString(cryptoAssets.UTF8_ENC);

  // Attempt to load and verify the encrypted key.
  const loadedPlainKey = secureTool.createPrivateKey(encryptedPemString, keyPassword);
  verifyContentEquivalence(loadedPlainKey.toPrivatePem().toString(), cryptoAssets.PRIVATE_KEY_PEM.toString(), 'Encrypted PEM roundtrip verification failed');

  // Test with explicit output encoding.
  const encryptedPemStringEncoded = rsaObject.toEncryptedPrivatePem(keyPassword, cipherMethod, cryptoAssets.UTF8_ENC);
  const loadedPlainKeyEncoded = secureTool.createPrivateKey(encryptedPemStringEncoded, keyPassword);
  verifyContentEquivalence(loadedPlainKeyEncoded.toPrivatePem().toString(), cryptoAssets.PRIVATE_KEY_PEM.toString(), 'Encoded encrypted PEM roundtrip failed');
}

/**
 * Tests the decryption functionality of a private key.
 * @param {object} privateKeyObject - The private key for decryption.
 */
function verifyDecryptionProcess(privateKeyObject) {
  const ciphertextHex = cryptoAssets.PRIVATE_CIPHERTEXT_HEX_VAL;
  const expectedPlaintext = cryptoAssets.MESSAGE_PLAINTEXT;

  // Decrypt from buffer input.
  const encodedDataBuffer = bufferHelper.create(ciphertextHex, cryptoAssets.HEX_ENC);
  const decodedDataBufferResult = privateKeyObject.decrypt(encodedDataBuffer).toString(cryptoAssets.UTF8_ENC);
  check.strictEqual(decodedDataBufferResult, expectedPlaintext, 'Private decryption from buffer failed');

  // Decrypt from string input with explicit encodings.
  const decodedDataStringResult = privateKeyObject.decrypt(ciphertextHex, cryptoAssets.HEX_ENC, cryptoAssets.UTF8_ENC);
  check.strictEqual(decodedDataStringResult, expectedPlaintext, 'Private decryption from string failed');
}

/**
 * Validates the private encryption functionality.
 * @param {object} privateKeyObject - The private key for encryption.
 */
function validatePrivateEncryption(privateKeyObject) {
  const plaintext = cryptoAssets.MESSAGE_PLAINTEXT;
  const plaintextPadded = cryptoAssets.MESSAGE_PLAINTEXT_PADDED;
  const expectedCiphertext = cryptoAssets.PUBLIC_CIPHERTEXT_HEX_VAL;
  const expectedCiphertextNp = cryptoAssets.PUBLIC_CIPHERTEXT_NO_PADDING_HEX_VAL;

  // Test various encryption scenarios.
  const testCases = [
    {
      input: bufferHelper.create(plaintext, cryptoAssets.UTF8_ENC),
      outputEncoding: cryptoAssets.HEX_ENC,
      expected: expectedCiphertext,
      message: 'Private encryption with Buffer input failed'
    },
    {
      input: plaintext,
      inputEncoding: cryptoAssets.UTF8_ENC,
      outputEncoding: cryptoAssets.HEX_ENC,
      expected: expectedCiphertext,
      message: 'Private encryption with string input and explicit encodings failed'
    },
    {
      input: plaintext,
      inputEncoding: undefined, // Defaults to UTF8
      outputEncoding: cryptoAssets.HEX_ENC,
      expected: expectedCiphertext,
      message: 'Private encryption with string input and default input encoding failed'
    },
    {
      input: plaintextPadded,
      inputEncoding: cryptoAssets.UTF8_ENC,
      outputEncoding: cryptoAssets.HEX_ENC,
      padding: secureTool.RSA_NO_PADDING,
      expected: expectedCiphertextNp,
      message: 'Private encryption with no padding failed'
    }
  ];

  for (const tc of testCases) {
    const encryptedResult = privateKeyObject.privateEncrypt(tc.input, tc.inputEncoding, tc.outputEncoding, tc.padding);
    check.strictEqual(encryptedResult, tc.expected, tc.message);
  }
}

/**
 * Confirms the digital signature generation process.
 * @param {object} privateKeyObject - The private key for signing.
 */
function confirmSignatureGeneration(privateKeyObject) {
  const hashAlg = cryptoAssets.SHA256_ALG;
  const dataHashHex = cryptoAssets.PLAINTEXT_SHA256_HASH;
  const expectedSignatureHex = cryptoAssets.PLAINTEXT_SHA256_SIGNATURE;

  // Sign with explicit output encoding.
  let generatedSignature = privateKeyObject.sign(hashAlg, dataHashHex, cryptoAssets.HEX_ENC, cryptoAssets.BASE64_ENC);
  let signatureBuffer = bufferHelper.create(generatedSignature, cryptoAssets.BASE64_ENC);
  check.strictEqual(signatureBuffer.toString(cryptoAssets.HEX_ENC), expectedSignatureHex, 'Signature generation to Base64 failed');

  // Sign with buffer input and specific output encoding.
  const dataHashBuffer = bufferHelper.create(dataHashHex, cryptoAssets.HEX_ENC);
  generatedSignature = privateKeyObject.sign(hashAlg, dataHashBuffer, undefined, cryptoAssets.HEX_ENC);
  check.strictEqual(generatedSignature, expectedSignatureHex, 'Signature generation from Buffer failed');
}

/**
 * Assesses the hash-and-sign functionality.
 * @param {object} privateKeyObject - The private key for signing.
 */
function assessHashedSignatureGeneration(privateKeyObject) {
  const hashAlgorithm = cryptoAssets.SHA256_ALG;
  const messageContent = cryptoAssets.MESSAGE_PLAINTEXT;
  const expectedSignature = cryptoAssets.PLAINTEXT_SHA256_SIGNATURE;

  // Standard hash-and-sign.
  const standardSignature = privateKeyObject.hashAndSign(hashAlgorithm, messageContent, cryptoAssets.UTF8_ENC, cryptoAssets.HEX_ENC);
  check.strictEqual(standardSignature, expectedSignature, 'Standard hash-and-sign mismatch');

  // PSS hash-and-sign (salt is random, so only verify with corresponding public key).
  const pssSignature = privateKeyObject.hashAndSign(
    hashAlgorithm, messageContent, cryptoAssets.UTF8_ENC, cryptoAssets.HEX_ENC, true, secureTool.RSA_PKCS1_SALT_LEN_MAX
  );

  const correspondingPublicKey = secureTool.createPublicKey(privateKeyObject.toPublicPem());
  const verificationSuccess = correspondingPublicKey.hashAndVerify(
    hashAlgorithm,
    bufferHelper.create(messageContent, cryptoAssets.UTF8_ENC).toString(cryptoAssets.HEX_ENC), // Ensure consistent hash input format
    pssSignature,
    cryptoAssets.HEX_ENC,
    true,
    secureTool.RSA_PKCS1_SALT_LEN_MAX
  );
  check.ok(verificationSuccess, 'PSS hash-and-sign verification failed');
}

/**
 * Grouped tests for private key functionality.
 * @param {object} keyInstance - The private key object to test.
 */
function executePrivateKeyValidations(keyInstance) {
  examinePrivatePemExport(keyInstance);
  assessEncryptedPrivatePemExport(keyInstance);
  verifyDecryptionProcess(keyInstance);
  validatePrivateEncryption(keyInstance);
  assessHashedSignatureGeneration(keyInstance);
  confirmSignatureGeneration(keyInstance);
}


/*
 * Main test suite functions
 */

/**
 * Executes fundamental key creation and basic operations.
 */
function runCoreFunctionalityChecks() {
  // Test various key creation methods.
  const pubKey = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM);
  check.ok(secureTool.isPublicKey(pubKey), 'Failed to create public key');

  const privKey = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);
  check.ok(secureTool.isPrivateKey(privKey), 'Failed to create private key');

  const passPrivKey = secureTool.createPrivateKey(cryptoAssets.PASS_PRIVATE_KEY_PEM, cryptoAssets.PASSWORD_STR);
  check.ok(secureTool.isPrivateKey(passPrivKey), 'Failed to create password-protected private key');

  // Test key generation.
  const generatedKey = secureTool.generatePrivateKey(1024);
  check.ok(secureTool.isPrivateKey(generatedKey), 'Failed to generate new private key');

  // Test creation from string representations.
  const pubKeyFromString = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM.toString(cryptoAssets.UTF8_ENC));
  check.ok(secureTool.isPublicKey(pubKeyFromString), 'Failed to create public key from UTF8 string');

  const privKeyFromString = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM.toString(cryptoAssets.BASE64_ENC), undefined, cryptoAssets.BASE64_ENC);
  check.ok(secureTool.isPrivateKey(privKeyFromString), 'Failed to create private key from Base64 string');
}

/**
 * Validates the type-checking and assertion utilities of the library.
 */
function validateKeyTypeAssertions() {
  const publicKeyObj = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM);
  const privateKeyObj = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);
  const nonKey = "not a key string";

  // isCryptoObject checks
  check.ok(secureTool.isCryptoObject(publicKeyObj), 'isCryptoObject failed for public key');
  check.ok(secureTool.isCryptoObject(privateKeyObj), 'isCryptoObject failed for private key');
  check.strictEqual(secureTool.isCryptoObject(null), false, 'isCryptoObject failed for null');
  check.strictEqual(secureTool.isCryptoObject(nonKey), false, 'isCryptoObject failed for string');

  // isPublicKeyObject checks
  check.ok(secureTool.isPublicKeyObject(publicKeyObj), 'isPublicKeyObject failed for public key');
  check.strictEqual(secureTool.isPublicKeyObject(privateKeyObj), false, 'isPublicKeyObject failed for private key');
  check.strictEqual(secureTool.isPublicKeyObject(undefined), false, 'isPublicKeyObject failed for undefined');

  // isPrivateKeyObject checks
  check.strictEqual(secureTool.isPrivateKeyObject(publicKeyObj), false, 'isPrivateKeyObject failed for public key');
  check.ok(secureTool.isPrivateKeyObject(privateKeyObj), 'isPrivateKeyObject failed for private key');
  check.strictEqual(secureTool.isPrivateKeyObject(0), false, 'isPrivateKeyObject failed for zero');

  // ensureCryptoObject assertions
  check.doesNotThrow(() => secureTool.ensureCryptoObject(publicKeyObj), 'ensureCryptoObject should not throw for public key');
  check.doesNotThrow(() => secureTool.ensureCryptoObject(privateKeyObj), 'ensureCryptoObject should not throw for private key');
  check.throws(() => secureTool.ensureCryptoObject(null), /Expected a cryptographic key object/, 'ensureCryptoObject should throw for null');
  check.throws(() => secureTool.ensureCryptoObject({}), /Expected a cryptographic key object/, 'ensureCryptoObject should throw for empty object');

  // ensurePublicKeyObject assertions
  check.doesNotThrow(() => secureTool.ensurePublicKeyObject(publicKeyObj), 'ensurePublicKeyObject should not throw for public key');
  check.throws(() => secureTool.ensurePublicKeyObject(privateKeyObj), /Expected a public key object/, 'ensurePublicKeyObject should throw for private key');

  // ensurePrivateKeyObject assertions
  check.throws(() => secureTool.ensurePrivateKeyObject(publicKeyObj), /Expected a private key object/, 'ensurePrivateKeyObject should throw for public key');
  check.doesNotThrow(() => secureTool.ensurePrivateKeyObject(privateKeyObj), 'ensurePrivateKeyObject should not throw for private key');
}

/**
 * Tests the universal key creation function `secureTool.constructKey`.
 */
function verifyUniversalKeyCreation() {
  const privateKeyResult = secureTool.constructKey(cryptoAssets.PRIVATE_KEY_PEM);
  check.ok(secureTool.isPrivateKeyObject(privateKeyResult), 'constructKey failed to create private key');

  const publicKeyResult = secureTool.constructKey(cryptoAssets.PUBLIC_KEY_PEM);
  check.ok(secureTool.isPublicKeyObject(publicKeyResult), 'constructKey failed to create public key');

  // Test failure case for invalid input.
  try {
    secureTool.constructKey("invalid key data");
    check.fail('constructKey should have thrown for invalid input');
  } catch (err) {
    check.ok(err instanceof Error && /Invalid key format/.test(err.message), 'Expected "Invalid key format" error');
  }
}

/**
 * Validates the creation of a private key from its individual components.
 */
function confirmComponentBasedPrivateKeyConstruction() {
  const components = cryptoAssets.PRIVATE_KEY_COMPONENTS;
  const privateKeyFromParts = secureTool.buildPrivateKeyFromParts(
    components.modulus, components.exponent, components.p, components.q,
    components.dp, components.dq, components.inverseQ, components.d
  );

  check.ok(secureTool.isPrivateKeyObject(privateKeyFromParts), 'Failed to build private key from components');

  const referencePrivateKey = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_3_PEM);
  verifyContentEquivalence(privateKeyFromParts.toPrivatePem('utf8'), referencePrivateKey.toPrivatePem('utf8'), 'Component-built private key PEM mismatch');
}

/**
 * Validates the creation of a public key from its individual components.
 */
function confirmComponentBasedPublicKeyConstruction() {
  const publicKeyFromParts = secureTool.createPublicKeyFromComponents(
    bufferHelper.create(cryptoAssets.PSS_MODULUS_HEX_VAL, cryptoAssets.HEX_ENC),
    bufferHelper.create(cryptoAssets.EXPONENT_HEX_VAL, cryptoAssets.HEX_ENC)
  );

  check.ok(secureTool.isPublicKeyObject(publicKeyFromParts), 'Failed to build public key from components');

  const referencePublicKey = secureTool.createPublicKey(cryptoAssets.PSS_PUBLIC_KEY_PEM);
  verifyContentEquivalence(publicKeyFromParts.toPublicPem('utf8'), referencePublicKey.toPublicPem('utf8'), 'Component-built public key PEM mismatch');
}

/**
 * Ensures that `createPublicKey` correctly rejects private key inputs.
 */
function ensurePublicKeyCreationFailure() {
  check.throws(
    () => secureTool.makePublicKey(cryptoAssets.PRIVATE_KEY_PEM),
    /Input is not a valid public key representation/,
    'makePublicKey should reject private key data'
  );
  check.throws(
    () => secureTool.makePublicKey("not a key"),
    /Input is not a valid public key representation/,
    'makePublicKey should reject arbitrary string'
  );
}

/**
 * Ensures that `createPrivateKey` correctly rejects public key inputs.
 */
function ensurePrivateKeyCreationFailure() {
  check.throws(
    () => secureTool.makePrivateKey(cryptoAssets.PUBLIC_KEY_PEM),
    /Input is not a valid private key representation/,
    'makePrivateKey should reject public key data'
  );
  check.throws(
    () => secureTool.makePrivateKey("not a key"),
    /Input is not a valid private key representation/,
    'makePrivateKey should reject arbitrary string'
  );
}

/**
 * Validates the `coerceKey` function for converting various inputs to key objects.
 */
function validateKeyCoercion() {
  const originalPrivateKey = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);
  const originalPublicKey = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM);

  // Coerce from Buffer and string.
  check.ok(secureTool.isPrivateKeyObject(secureTool.adaptKeyInput(cryptoAssets.PRIVATE_KEY_PEM)), 'coerceKey failed for private key buffer');
  check.ok(secureTool.isPrivateKeyObject(secureTool.adaptKeyInput(cryptoAssets.PRIVATE_KEY_PEM.toString())), 'coerceKey failed for private key string');
  check.ok(secureTool.isPublicKeyObject(secureTool.adaptKeyInput(cryptoAssets.PUBLIC_KEY_PEM)), 'coerceKey failed for public key buffer');
  check.ok(secureTool.isPublicKeyObject(secureTool.adaptKeyInput(cryptoAssets.PUBLIC_KEY_PEM.toString())), 'coerceKey failed for public key string');

  // Coerce already existing key objects.
  check.strictEqual(secureTool.adaptKeyInput(originalPrivateKey), originalPrivateKey, 'coerceKey should return same object for private key');
  check.strictEqual(secureTool.adaptKeyInput(originalPublicKey), originalPublicKey, 'coerceKey should return same object for public key');
}

/**
 * Validates the `coercePrivateKey` function.
 */
function validatePrivateKeyCoercion() {
  const originalPrivateKey = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);

  check.ok(secureTool.isPrivateKeyObject(secureTool.coercePrivateKey(cryptoAssets.PRIVATE_KEY_PEM)), 'coercePrivateKey failed for private key buffer');
  check.ok(secureTool.isPrivateKeyObject(secureTool.coercePrivateKey(cryptoAssets.PRIVATE_KEY_PEM.toString())), 'coercePrivateKey failed for private key string');
  check.strictEqual(secureTool.coercePrivateKey(originalPrivateKey), originalPrivateKey, 'coercePrivateKey should return same object for private key');
}

/**
 * Validates the `coercePublicKey` function.
 */
function validatePublicKeyCoercion() {
  const originalPublicKey = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM);

  check.ok(secureTool.isPublicKeyObject(secureTool.coercePublicKey(cryptoAssets.PUBLIC_KEY_PEM)), 'coercePublicKey failed for public key buffer');
  check.ok(secureTool.isPublicKeyObject(secureTool.coercePublicKey(cryptoAssets.PUBLIC_KEY_PEM.toString())), 'coercePublicKey failed for public key string');
  check.strictEqual(secureTool.coercePublicKey(originalPublicKey), originalPublicKey, 'coercePublicKey should return same object for public key');
}

/**
 * Confirms that `coerceKey` appropriately fails for invalid inputs.
 */
function confirmKeyCoercionFailure() {
  check.throws(() => secureTool.adaptKeyInput("junk data"), /Failed to coerce input into a cryptographic key/, 'coerceKey should throw for invalid string');
  check.throws(() => secureTool.adaptKeyInput(bufferHelper.create(200)), /Failed to coerce input into a cryptographic key/, 'coerceKey should throw for random buffer');
  check.throws(() => secureTool.adaptKeyInput([]), /Failed to coerce input into a cryptographic key/, 'coerceKey should throw for array');
}

/**
 * Confirms that `coercePrivateKey` appropriately fails for invalid inputs.
 */
function confirmPrivateKeyCoercionFailure() {
  check.throws(() => secureTool.coercePrivateKey("junk data"), /Unable to coerce input to a private key/, 'coercePrivateKey should throw for invalid string');
  check.throws(() => secureTool.coercePrivateKey(bufferHelper.create(200)), /Unable to coerce input to a private key/, 'coercePrivateKey should throw for random buffer');
  check.throws(() => secureTool.coercePrivateKey({}), /Unable to coerce input to a private key/, 'coercePrivateKey should throw for object');
  check.throws(() => secureTool.coercePrivateKey(cryptoAssets.PUBLIC_KEY_PEM), /Unable to coerce input to a private key/, 'coercePrivateKey should throw for public key buffer');
  check.throws(() => secureTool.coercePrivateKey(cryptoAssets.PUBLIC_KEY_PEM.toString()), /Unable to coerce input to a private key/, 'coercePrivateKey should throw for public key string');
}

/**
 * Confirms that `coercePublicKey` appropriately fails for invalid inputs.
 */
function confirmPublicKeyCoercionFailure() {
  check.throws(() => secureTool.coercePublicKey("junk data"), /Unable to coerce input to a public key/, 'coercePublicKey should throw for invalid string');
  check.throws(() => secureTool.coercePublicKey(bufferHelper.create(200)), /Unable to coerce input to a public key/, 'coercePublicKey should throw for random buffer');
  check.throws(() => secureTool.coercePublicKey([]), /Unable to coerce input to a public key/, 'coercePublicKey should throw for array');
  check.throws(() => secureTool.coercePublicKey(cryptoAssets.PRIVATE_KEY_PEM), /Unable to coerce input to a public key/, 'coercePublicKey should throw for private key buffer');
  check.throws(() => secureTool.coercePublicKey(cryptoAssets.PRIVATE_KEY_PEM.toString()), /Unable to coerce input to a public key/, 'coercePublicKey should throw for private key string');
}

/**
 * Orchestrates tests specifically for public key functionalities.
 */
function testWithPublicKeyObject() {
  const pubKey = secureTool.createPublicKey(cryptoAssets.PUBLIC_KEY_PEM);
  secureTool.ensurePublicKeyObject(pubKey); // Guard clause
  executePublicKeyValidations(pubKey);
}

/**
 * Orchestrates tests for both public and private key functionalities on a private key object.
 */
function testWithPrivateKeyObject() {
  const privKey = secureTool.createPrivateKey(cryptoAssets.PRIVATE_KEY_PEM);
  secureTool.ensurePrivateKeyObject(privKey); // Guard clause
  executePublicKeyValidations(privKey); // Private keys can also perform public key operations
  executePrivateKeyValidations(privKey);
}

/**
 * Tests a newly generated key for basic functionality.
 */
function validateGeneratedKey() {
  const generatedRsaKey = secureTool.generatePrivateKey();
  check.ok(secureTool.isPrivateKeyObject(generatedRsaKey), 'Generated key is not a private key object');
  // Simple round-trip test to confirm usability
  const testMessage = "Hello secure world!";
  const encryptedMsg = generatedRsaKey.privateEncrypt(testMessage, cryptoAssets.UTF8_ENC, cryptoAssets.BASE64_ENC);
  const decryptedMsg = generatedRsaKey.publicDecrypt(encryptedMsg, cryptoAssets.BASE64_ENC, cryptoAssets.UTF8_ENC);
  check.strictEqual(decryptedMsg, testMessage, 'Generated key failed basic private encrypt/public decrypt roundtrip');
}

// Export the test functions for external execution if needed.
module.exports = {
  runCoreFunctionalityChecks,
  validateKeyTypeAssertions,
  verifyUniversalKeyCreation,
  confirmComponentBasedPrivateKeyConstruction,
  confirmComponentBasedPublicKeyConstruction,
  ensurePublicKeyCreationFailure,
  ensurePrivateKeyCreationFailure,
  validateKeyCoercion,
  validatePrivateKeyCoercion,
  validatePublicKeyCoercion,
  confirmKeyCoercionFailure,
  confirmPrivateKeyCoercionFailure,
  confirmPublicKeyCoercionFailure,
  testWithPublicKeyObject,
  testWithPrivateKeyObject,
  validateGeneratedKey
};