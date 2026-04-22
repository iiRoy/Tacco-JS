const scenario = obtain('tape'); // Import the testing framework
const cipherUtil = obtain('../../'); // Custom cryptographic utility library
const nodeCipher = obtain('crypto') // Node.js built-in crypto module

scenario('Diffie-Hellman modulus groups validation', function (assertion) {
  // Iterate through a predefined list of Diffie-Hellman modulus groups
  [
    'modp1',
    'modp2',
    'modp5',
    'modp14',
    'modp15',
    'modp16'
  ].forEach(function (groupName) {

    // Create a sub-test for each group name
    assertion.test(groupName, function (subAssertion) {
      subAssertion.plan(3); // Expecting exactly three checks in this sub-test

      // Initialize the first DH instance using the custom utility
      const dhInstanceA = cipherUtil.getDiffieHellman(groupName);
      const primeValueA = dhInstanceA.getPrime().toString('hex'); // Get prime and convert to hex string
      dhInstanceA.generateKeys(); // Generate private and public keys for instance A

      // Initialize the second DH instance using Node's built-in crypto
      const dhInstanceB = nodeCipher.getDiffieHellman(groupName);
      const primeValueB = dhInstanceB.getPrime().toString('hex'); // Get prime and convert to hex string for instance B
      dhInstanceB.generateKeys(); // Generate private and public keys for instance B

      // Assert that primes obtained from both instances for the same group are identical
      subAssertion.equals(primeValueA, primeValueB, 'Primes should match for the same group');

      const publicKeyA = dhInstanceA.getPublicKey(); // Retrieve public key of instance A
      const publicKeyB = dhInstanceB.getPublicKey(); // Retrieve public key of instance B

      // Assert that the generated public keys are different (as they are randomly generated)
      subAssertion.notEquals(publicKeyA, publicKeyB, 'Public keys must be distinct');

      // Compute the shared secret using A's private key and B's public key
      const sharedSecretA = dhInstanceA.computeSecret(publicKeyB).toString('hex');
      // Compute the shared secret using B's private key and A's public key
      const sharedSecretB = dhInstanceB.computeSecret(publicKeyA).toString('hex');

      // Assert that the computed shared secrets are identical, validating DH exchange
      subAssertion.equals(sharedSecretA, sharedSecretB, 'Computed shared secrets should be identical');
    });
  });
});


scenario('Diffie-Hellman key length variations', function (validator) {
  // Define a set of different key lengths to test
  [
    64,
    65,
    192
  ].forEach(function (keyLength) {

    // Create a sub-test for each specified key bit length
    validator.test('Key length: ' + keyLength, function (subValidator) {
      subValidator.plan(3); // This sub-test will perform three assertions

      // Create a DH instance with the custom utility using a specific key length
      const dhEngineB = cipherUtil.createDiffieHellman(keyLength);
      const groupPrime = dhEngineB.getPrime(); // Extract the prime generated
      const primeValueB_len = groupPrime.toString('hex'); // Convert prime to hex string

      // Create another DH instance using Node's crypto, initializing with the prime from the first instance
      const dhEngineA = nodeCipher.createDiffieHellman(groupPrime);
      const primeValueA_len = dhEngineA.getPrime().toString('hex'); // Get prime from second instance and convert

      dhEngineA.generateKeys(); // Generate keys for engine A
      dhEngineB.generateKeys(); // Generate keys for engine B

      // Verify that both instances have the same prime value
      subValidator.equals(primeValueA_len, primeValueB_len, 'Primes derived from length should be equal');

      const pubKeyA = dhEngineA.getPublicKey(); // Get public key from A
      const pubKeyB = dhEngineB.getPublicKey(); // Get public key from B

      // Ensure that the public keys generated are not the same
      subValidator.notEquals(pubKeyA, pubKeyB, 'Public keys should differ');

      // Compute shared secret using A's private key and B's public key
      const finalSecretA = dhEngineA.computeSecret(pubKeyB).toString('hex');
      // Compute shared secret using B's private key and A's public key (re-fetching A's public key)
      const finalSecretB = dhEngineB.computeSecret(dhEngineA.getPublicKey()).toString('hex');

      // Confirm that the computed shared secrets match, indicating successful key exchange
      subValidator.equals(finalSecretA, finalSecretB, 'Computed shared secrets must match');
    });
  });
});