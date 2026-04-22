/*
 * Copyright 2012 The Obvious Corporation. All rights reserved.
 * This file is part of the ursa testing suite.
 */

// This enables strict mode for the entire script.
"use strict";


// Load necessary modules for testing.
var assert = require("assert"); // Node.js built-in assertion module.

// Custom test fixture and the ursa library under test.
var fixture = require("./fixture");
var ursa = fixture.ursa; // The main ursa library.


/**
 * Helper function: asserts that two strings are equal,
 * normalizing Windows-style newlines to Unix-style newlines
 * before comparison to prevent cross-platform test failures.
 *
 * @param {string} actual - The actual string value.
 * @param {string} expected - The expected string value.
 * @param {string} message - Optional message to display on failure.
 */
function assertStringEqual(actual, expected, message) {
  // Replace all occurrences of carriage return + newline with just newline.
  assert.equal(actual.replace(/\r\n/g, '\n'), expected.replace(/\r\n/g, '\n'), message);
}


// --- Utility functions for key property testing ---

function test_getExponent(key) {
  // Test retrieving exponent as a Buffer.
  var buf = key.getExponent();
  assert.equal(buf.toString(fixture.HEX), fixture.EXPONENT_HEX);

  // Test retrieving exponent as a hex string.
  var result = key.getExponent(fixture.HEX);
  assert.equal(result, fixture.EXPONENT_HEX);

  // Test retrieving exponent as a base64 string.
  result = key.getExponent(fixture.BASE64);
  assert.equal(result, buf.toString(fixture.BASE64));

  // Test retrieving exponent as a binary string.
  result = key.getExponent(fixture.BINARY);
  assert.equal(result, buf.toString(fixture.BINARY));

  // Test retrieving exponent as a UTF8 string.
  result = key.getExponent(fixture.UTF8);
  assert.equal(result, buf.toString(fixture.UTF8));
}

function test_getModulus(key) {
  // Test retrieving modulus as a Buffer.
  var buf = key.getModulus();
  assert.equal(buf.toString(fixture.HEX), fixture.MODULUS_HEX);

  // Test retrieving modulus as a hex string.
  var result = key.getModulus(fixture.HEX);
  assert.equal(result, fixture.MODULUS_HEX);

  // Test retrieving modulus as a base64 string.
  result = key.getModulus(fixture.BASE64);
  assert.equal(result, buf.toString(fixture.BASE64));

  // Test retrieving modulus as a binary string.
  result = key.getModulus(fixture.BINARY);
  assert.equal(result, buf.toString(fixture.BINARY));

  // Test retrieving modulus as a UTF8 string.
  result = key.getModulus(fixture.UTF8);
  assert.equal(result, buf.toString(fixture.UTF8));
}

function test_toPublicPem(key) {
  // Convert fixture public key to UTF8 string for comparison.
  var keyString = fixture.PUBLIC_KEY.toString(fixture.UTF8);

  // Test default toPublicPem output (Buffer) converted to UTF8.
  var result = key.toPublicPem().toString(fixture.UTF8);
  assertStringEqual(result, keyString);

  // Test toPublicPem with explicit UTF8 encoding.
  result = key.toPublicPem(fixture.UTF8);
  assertStringEqual(result, keyString);
}

function test_toPublicSsh(key) {
  // Convert fixture SSH public key to BASE64 string for comparison.
  var keyString = fixture.SSH_PUBLIC_KEY.toString(fixture.BASE64);

  // Test default toPublicSsh output (Buffer) converted to BASE64.
  var result = key.toPublicSsh().toString(fixture.BASE64);
  assert.equal(result, keyString);

  // Test toPublicSsh with explicit BASE64 encoding.
  result = key.toPublicSsh(fixture.BASE64);
  assert.equal(result, keyString);
}

function test_toPublicSshFingerprint(key) {
  // Test default toPublicSshFingerprint output (Buffer) converted to HEX.
  var result = key.toPublicSshFingerprint().toString(fixture.HEX);
  assert.equal(result, fixture.SSH_PUBLIC_KEY_FINGERPRINT_HEX);

  // Test toPublicSshFingerprint with explicit HEX encoding.
  result = key.toPublicSshFingerprint(fixture.HEX);
  assert.equal(result, fixture.SSH_PUBLIC_KEY_FINGERPRINT_HEX);
}

function test_encrypt(key) {
  // Encrypt/decrypt round trip is the most reliable test.

  // Create a private key instance for decryption.
  var privKey = ursa.createPrivateKey(fixture.PRIVATE_KEY);

  // Encrypt with default settings (Buffer input, Buffer output).
  var encoded = key.encrypt(new Buffer(fixture.PLAINTEXT, fixture.UTF8));
  var decoded = privKey.decrypt(encoded, undefined, fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);

  // Encrypt with string input (UTF8), base64 output.
  encoded = key.encrypt(fixture.PLAINTEXT, fixture.UTF8, fixture.BASE64);
  decoded = privKey.decrypt(encoded, fixture.BASE64, fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);

  // Encrypt with string input (default), hex output.
  encoded = key.encrypt(fixture.PLAINTEXT, undefined, fixture.HEX);
  decoded = privKey.decrypt(encoded, fixture.HEX, fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);
}

function test_publicDecrypt(key) {
  // Decrypt a pre-encrypted ciphertext using the public key.

  // Decrypt Buffer input, default output (Buffer) converted to UTF8.
  var encoded = new Buffer(fixture.PUBLIC_CIPHERTEXT_HEX, fixture.HEX);
  var decoded = key.publicDecrypt(encoded).toString(fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);

  // Decrypt string input (HEX), UTF8 output.
  decoded = key.publicDecrypt(fixture.PUBLIC_CIPHERTEXT_HEX, fixture.HEX,
    fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);

  // Decrypt string input (HEX), UTF8 output, with NO_PADDING.
  decoded = key.publicDecrypt(fixture.PUBLIC_CIPHERTEXT_NP_HEX, fixture.HEX,
    fixture.UTF8, ursa.RSA_NO_PADDING);
  assert.equal(decoded, fixture.PLAINTEXT_PADDED);
}

function test_verify(key) {
  // Verify a signature against a hash.

  // Verify with string inputs (HEX).
  assert.equal(key.verify(fixture.SHA256, fixture.PLAINTEXT_SHA256,
    fixture.PLAINTEXT_SHA256_SIGNATURE,
    fixture.HEX), true);

  // Verify with Buffer inputs.
  var hash = new Buffer(fixture.PLAINTEXT_SHA256, fixture.HEX);
  var sig = new Buffer(fixture.PLAINTEXT_SHA256_SIGNATURE, fixture.HEX);
  assert.equal(key.verify(fixture.SHA256, hash, sig), true);
}

function test_hashAndVerify(key) {
  // Hash the plaintext and then verify the signature.

  // Hash plaintext (UTF8), verify signature (HEX).
  assert.equal(key.hashAndVerify(fixture.SHA256,
    new Buffer(fixture.PLAINTEXT, fixture.UTF8),
    fixture.PLAINTEXT_SHA256_SIGNATURE,
    fixture.HEX),
    true);

  // Test PSS verification (requires specific key components).
  var key2 = ursa.createPublicKeyFromComponents(
    new Buffer(fixture.PSS_MODULUS_HEX, fixture.HEX),
    new Buffer(fixture.EXPONENT_HEX, fixture.HEX));

  // PSS verification with explicit salt length.
  assert.equal(key2.hashAndVerify(fixture.SHA1,
    fixture.PSS_M_HEX,
    fixture.PSS_S_HEX,
    fixture.HEX,
    true,
    ursa.RSA_PKCS1_SALT_LEN_HLEN),
    true);

  // PSS verification with default salt length.
  assert.equal(key2.hashAndVerify(fixture.SHA1,
    fixture.PSS_M_HEX,
    fixture.PSS_S_HEX,
    fixture.HEX,
    true),
    true);
}

// Consolidates all public key method tests.
function testPublicKeyMethods(key) {
  test_getExponent(key);
  test_getModulus(key);
  test_toPublicPem(key);
  test_toPublicSsh(key);
  test_toPublicSshFingerprint(key);
  test_encrypt(key);
  test_publicDecrypt(key);
  test_verify(key);
  test_hashAndVerify(key);
}

function test_toPrivatePem(key) {
  // Convert fixture private key to UTF8 string for comparison.
  var keyString = fixture.PRIVATE_KEY.toString(fixture.UTF8);

  // Test default toPrivatePem output (Buffer) converted to UTF8.
  var result = key.toPrivatePem().toString(fixture.UTF8);
  assertStringEqual(result, keyString);

  // Test toPrivatePem with explicit UTF8 encoding.
  result = key.toPrivatePem(fixture.UTF8);
  assertStringEqual(result, keyString);
}

function test_toEncryptedPrivatePem(key) {
  var password = fixture.PASSWORD.toString(fixture.UTF8);
  var cipher = fixture.DES_EDE3_CBC;

  var keyString = fixture.PASS_PRIVATE_KEY.toString(fixture.UTF8); // Original encrypted key string.

  // Generate encrypted PEM with password and cipher.
  var pem = key.toEncryptedPrivatePem(password, cipher).toString(fixture.UTF8);

  // Create a new private key from the generated encrypted PEM, using the password.
  var plainTextKey = ursa.createPrivateKey(pem, password);
  // Assert that the decrypted key's PEM matches the original plaintext private key.
  assertStringEqual(plainTextKey.toPrivatePem().toString(), fixture.PRIVATE_KEY.toString());


  // Repeat test with explicit UTF8 encoding for the output PEM.
  pem = key.toEncryptedPrivatePem(password, cipher, fixture.UTF8).toString(fixture.UTF8);

  plainTextKey = ursa.createPrivateKey(pem, password);
  assertStringEqual(plainTextKey.toPrivatePem().toString(), fixture.PRIVATE_KEY.toString());
}

function test_decrypt(key) {
  // Decrypt a pre-encrypted ciphertext using the private key.

  // Decrypt Buffer input, default output (Buffer) converted to UTF8.
  var encoded = new Buffer(fixture.PRIVATE_CIPHERTEXT_HEX, fixture.HEX);
  var decoded = key.decrypt(encoded).toString(fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);

  // Decrypt string input (HEX), UTF8 output.
  decoded = key.decrypt(fixture.PRIVATE_CIPHERTEXT_HEX, fixture.HEX,
    fixture.UTF8);
  assert.equal(decoded, fixture.PLAINTEXT);
}

function test_privateEncrypt(key) {
  // Encrypt using the private key (for public decryption later).

  // Private encrypt Buffer input, default output (Buffer) converted to HEX.
  var encoded = key.privateEncrypt(
    new Buffer(fixture.PLAINTEXT, fixture.UTF8)).toString(fixture.HEX);
  assert.equal(encoded, fixture.PUBLIC_CIPHERTEXT_HEX);

  // Private encrypt string input (UTF8), HEX output.
  encoded = key.privateEncrypt(fixture.PLAINTEXT, fixture.UTF8, fixture.HEX);
  assert.equal(encoded, fixture.PUBLIC_CIPHERTEXT_HEX);

  // Private encrypt string input (default), HEX output.
  encoded = key.privateEncrypt(fixture.PLAINTEXT, undefined, fixture.HEX);
  assert.equal(encoded, fixture.PUBLIC_CIPHERTEXT_HEX);

  // Private encrypt with NO_PADDING.
  encoded = key.privateEncrypt(fixture.PLAINTEXT_PADDED, fixture.UTF8, fixture.HEX, ursa.RSA_NO_PADDING);
  assert.equal(encoded, fixture.PUBLIC_CIPHERTEXT_NP_HEX);
}

function test_sign(key) {
  // Sign a hash.

  // Sign hash (HEX), output signature as BASE64.
  var sig = key.sign(fixture.SHA256,
    fixture.PLAINTEXT_SHA256, fixture.HEX,
    fixture.BASE64);
  sig = new Buffer(sig, fixture.BASE64); // Convert BASE64 string back to Buffer.
  assert.equal(sig.toString(fixture.HEX), fixture.PLAINTEXT_SHA256_SIGNATURE);

  // Sign Buffer hash, output signature as HEX.
  var buf = new Buffer(fixture.PLAINTEXT_SHA256, fixture.HEX);
  sig = key.sign(fixture.SHA256, buf, undefined, fixture.HEX);
  assert.equal(sig, fixture.PLAINTEXT_SHA256_SIGNATURE);
}

function test_hashAndSign(key) {
  // Hash the plaintext and then sign it.

  // Hash plaintext (UTF8), sign, output signature as HEX.
  var sig = key.hashAndSign(fixture.SHA256, fixture.PLAINTEXT,
    fixture.UTF8, fixture.HEX);
  assert.equal(sig, fixture.PLAINTEXT_SHA256_SIGNATURE);

  // PSS signing produces a random salt, so direct fixture comparison isn't possible.
  // Instead, we sign and then immediately verify.

  sig = key.hashAndSign(fixture.SHA256, fixture.PLAINTEXT,
    fixture.UTF8, fixture.HEX,
    true, ursa.RSA_PKCS1_SALT_LEN_MAX);

  // Verify the generated PSS signature.
  assert.equal(key.hashAndVerify(
    fixture.SHA256,
    new Buffer(fixture.PLAINTEXT).toString(fixture.HEX), // Plaintext converted to HEX for hashAndVerify.
    sig,
    fixture.HEX,
    true,
    ursa.RSA_PKCS1_SALT_LEN_MAX),
    true);
}

// Consolidates all private key method tests.
function testPrivateKeyMethods(key) {
  test_toPrivatePem(key);
  test_toEncryptedPrivatePem(key);
  test_decrypt(key);
  test_privateEncrypt(key);
  test_hashAndSign(key);
  test_sign(key);
}


// --- Main test functions ---

function testBasics() {
  // Basic key creation and generation sanity checks.
  ursa.createPublicKey(fixture.PUBLIC_KEY);
  ursa.createPrivateKey(fixture.PRIVATE_KEY);
  ursa.createPrivateKey(fixture.PASS_PRIVATE_KEY, fixture.PASSWORD);
  ursa.generatePrivateKey(512); // Generate a new 512-bit private key.

  // Test key creation with string inputs and explicit encodings.
  ursa.createPublicKey(fixture.PUBLIC_KEY.toString(fixture.UTF8));
  ursa.createPrivateKey(fixture.PRIVATE_KEY.toString(fixture.BASE64),
    undefined, fixture.BASE64);
}

function testTypes() {
  var pub = ursa.createPublicKey(fixture.PUBLIC_KEY);
  var priv = ursa.createPrivateKey(fixture.PRIVATE_KEY);
  var msg;

  // Test isKey() function.
  msg = "Problem with isKey()";
  assert.equal(ursa.isKey(pub), true, msg);
  assert.equal(ursa.isKey(priv), true, msg);
  assert.equal(ursa.isKey(undefined), false, msg);
  assert.equal(ursa.isKey("x"), false, msg);

  // Test isPublicKey() function.
  msg = "Problem with isPublicKey()";
  assert.equal(ursa.isPublicKey(pub), true, msg);
  assert.equal(ursa.isPublicKey(priv), false, msg);
  assert.equal(ursa.isPublicKey(undefined), false, msg);
  assert.equal(ursa.isPublicKey("x"), false, msg);

  // Test isPrivateKey() function.
  msg = "Problem with isPrivateKey()";
  assert.equal(ursa.isPrivateKey(pub), false, msg);
  assert.equal(ursa.isPrivateKey(priv), true, msg);
  assert.equal(ursa.isPrivateKey(undefined), false, msg);
  assert.equal(ursa.isPrivateKey("x"), false, msg);

  // Test assertKey() function (doesNotThrow for valid, throws for invalid).
  assert.doesNotThrow(function () { ursa.assertKey(pub); });
  assert.doesNotThrow(function () { ursa.assertKey(priv); });
  assert.throws(function () { ursa.assertKey(undefined); });
  assert.throws(function () { ursa.assertKey("x"); });

  // Test assertPublicKey() function.
  assert.doesNotThrow(function () { ursa.assertPublicKey(pub); });
  assert.throws(function () { ursa.assertPublicKey(priv); });
  assert.throws(function () { ursa.assertPublicKey(undefined); });
  assert.throws(function () { ursa.assertPublicKey("x"); });

  // Test assertPrivateKey() function.
  assert.throws(function () { ursa.assertPrivateKey(pub); });
  assert.doesNotThrow(function () { ursa.assertPrivateKey(priv); });
  assert.throws(function () { ursa.assertPrivateKey(undefined); });
  assert.throws(function () { ursa.assertPrivateKey("x"); });
}

function test_createKey() {
  // createKey should correctly identify and create private keys.
  var priv = ursa.createKey(fixture.PRIVATE_KEY);
  assert(ursa.isPrivateKey(priv), true);

  // createKey should correctly identify and create public keys.
  var pub = ursa.createKey(fixture.PUBLIC_KEY);
  assert(ursa.isPublicKey(pub), true);

  // createKey should throw for invalid input.
  function f1() {
    ursa.createKey("yo there");
  }
  assert.throws(f1, /Not a key\./);
}

function test_createPrivateKeyFromComponents() {
  // Create a private key using individual RSA components.
  var privFromComponents = ursa.createPrivateKeyFromComponents(
    fixture.PRIVATE_KEY_COMPONENTS.modulus,
    fixture.PRIVATE_KEY_COMPONENTS.exponent,
    fixture.PRIVATE_KEY_COMPONENTS.p,
    fixture.PRIVATE_KEY_COMPONENTS.q,
    fixture.PRIVATE_KEY_COMPONENTS.dp,
    fixture.PRIVATE_KEY_COMPONENTS.dq,
    fixture.PRIVATE_KEY_COMPONENTS.inverseQ,
    fixture.PRIVATE_KEY_COMPONENTS.d);

  assert(ursa.isPrivateKey(privFromComponents), true);

  // Create a private key from a PEM string for comparison.
  var privFromPem = ursa.createPrivateKey(fixture.PRIVATE_KEY_3);

  // The PEM representations should be identical.
  assert.equal(privFromComponents.toPrivatePem('utf8'), privFromPem.toPrivatePem('utf8'));
}

function test_createPublicKeyFromComponents() {
  // Create a public key using individual RSA components (modulus and exponent).
  var pubFromComponents = ursa.createPublicKeyFromComponents(
    new Buffer(fixture.PSS_MODULUS_HEX, fixture.HEX),
    new Buffer(fixture.EXPONENT_HEX, fixture.HEX));

  assert(ursa.isPublicKey(pubFromComponents), true);

  // Create a public key from a PEM string for comparison.
  var pubFromPem = ursa.createPublicKey(fixture.PSS_PUBLIC_KEY);

  // The PEM representations should be identical.
  assert.equal(pubFromComponents.toPublicPem('utf8'),
    pubFromPem.toPublicPem('utf8'));
}

function test_fail_createPublicKey() {
  // Ensure createPublicKey throws when given a private key.
  function f1() {
    ursa.createPublicKey(fixture.PRIVATE_KEY);
  }
  assert.throws(f1, /Not a public key\./);
}

function test_fail_createPrivateKey() {
  // Ensure createPrivateKey throws when given a public key.
  function f1() {
    ursa.createPrivateKey(fixture.PUBLIC_KEY);
  }
  assert.throws(f1, /Not a private key\./);
}

function test_coerceKey() {
  // Coerce from Buffer private key.
  var priv = ursa.coerceKey(fixture.PRIVATE_KEY);
  assert(ursa.isPrivateKey(priv), true);

  // Coerce from string private key.
  priv = ursa.coerceKey(fixture.PRIVATE_KEY.toString());
  assert(ursa.isPrivateKey(priv), true);

  // Coerce from Buffer public key.
  var pub = ursa.coerceKey(fixture.PUBLIC_KEY);
  assert(ursa.isPublicKey(pub), true);

  // Coerce from string public key.
  pub = ursa.coerceKey(fixture.PUBLIC_KEY.toString());
  assert(ursa.isPublicKey(pub), true);

  // Coercing an already-Ursa-key should return the same instance.
  assert.equal(ursa.coerceKey(priv), priv);
  assert.equal(ursa.coerceKey(pub), pub);
}

function test_coercePrivateKey() {
  // Coerce from Buffer private key.
  var priv = ursa.coercePrivateKey(fixture.PRIVATE_KEY);
  assert(ursa.isPrivateKey(priv), true);

  // Coerce from string private key.
  priv = ursa.coercePrivateKey(fixture.PRIVATE_KEY.toString());
  assert(ursa.isPrivateKey(priv), true);

  // Coercing an already-Ursa-private-key should return the same instance.
  assert.equal(ursa.coercePrivateKey(priv), priv);
}

function test_coercePublicKey() {
  // Coerce from Buffer public key.
  var pub = ursa.coercePublicKey(fixture.PUBLIC_KEY);
  assert(ursa.isPublicKey(pub), true);

  // Coerce from string public key.
  pub = ursa.coercePublicKey(fixture.PUBLIC_KEY.toString());
  assert(ursa.isPublicKey(pub), true);

  // Coercing an already-Ursa-public-key should return the same instance.
  assert.equal(ursa.coercePublicKey(pub), pub);
}

function test_fail_coerceKey() {
  // coerceKey should throw for non-key inputs.
  function f1() {
    ursa.coerceKey("foo");
  }
  assert.throws(f1, /Not a key/);

  function f2() {
    ursa.coerceKey(new Buffer(200));
  }
  assert.throws(f2, /Not a key/);

  function f3() {
    ursa.coerceKey([]);
  }
  assert.throws(f3, /Not a key/);
}

function test_fail_coercePrivateKey() {
  // coercePrivateKey should throw for non-private-key inputs.
  function f1() {
    ursa.coercePrivateKey("foo");
  }
  assert.throws(f1, /Not a private key/);

  function f2() {
    ursa.coercePrivateKey(new Buffer(200));
  }
  assert.throws(f2, /Not a private key/);

  function f3() {
    ursa.coercePrivateKey([]);
  }
  assert.throws(f3, /Not a private key/);

  // coercePrivateKey should throw if given a public key.
  function f4() {
    ursa.coercePrivateKey(fixture.PUBLIC_KEY);
  }
  assert.throws(f4, /Not a private key/);

  function f5() {
    ursa.coercePrivateKey(fixture.PUBLIC_KEY.toString());
  }
  assert.throws(f5, /Not a private key/);
}

function test_fail_coercePublicKey() {
  // coercePublicKey should throw for non-public-key inputs.
  function f1() {
    ursa.coercePublicKey("foo");
  }
  assert.throws(f1, /Not a public key/);

  function f2() {
    ursa.coercePublicKey(new Buffer(200));
  }
  assert.throws(f2, /Not a public key/);

  function f3() {
    ursa.coercePublicKey([]);
  }
  assert.throws(f3, /Not a public key/);

  // coercePublicKey should throw if given a private key.
  function f4() {
    ursa.coercePublicKey(fixture.PRIVATE_KEY);
  }
  assert.throws(f4, /Not a public key/);

  function f5() {
    ursa.coercePublicKey(fixture.PRIVATE_KEY.toString());
  }
  assert.throws(f5, /Not a public key/);
}

function testPublicKey() {
  // Create a public key and run all public key method tests.
  var key = ursa.createPublicKey(fixture.PUBLIC_KEY);
  testPublicKeyMethods(key);
}

function testPrivateKey() {
  // Create a private key and run both public and private key method tests.
  var key = ursa.createPrivateKey(fixture.PRIVATE_KEY);
  testPublicKeyMethods(key); // A private key instance also has public key methods.
  testPrivateKeyMethods(key);
}

function testGeneratedKey() {
  // Simple test for generatePrivateKey: create one and ensure it's a valid key.
  // More comprehensive testing is handled at the native level.
  var key = ursa.generatePrivateKey();
  // No assertions here, just ensuring it doesn't throw and returns a key.
  // The subsequent tests (e.g., testPrivateKeyMethods) would implicitly test it if called.
}