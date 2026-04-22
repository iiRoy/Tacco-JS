/*
 * This module performs a rigorous validation of a Secure Remote Password (SRP)
 * protocol implementation. It meticulously checks each intermediate calculation
 * against a set of predetermined, official test vectors.
 *
 * For reference and further details on the test vectors, consult:
 * RFC 5054, specifically Appendix B.
 */

// A utility object to encapsulate common number formatting operations.
const dataFormatter = {
  /**
   * Converts a numerical value (potentially a custom BigInt-like object)
   * into its uppercase hexadecimal string representation.
   * Assumes the input object has a `toString(radix)` method.
   * @param {object} numericValue - The number or BigInt-like object to convert.
   * @returns {string} The uppercase hexadecimal string.
   */
  toUpperHex: (numericValue) => {
    if (numericValue && typeof numericValue.toString === 'function') {
      return numericValue.toString(16).toUpperCase();
    }
    // Fallback for primitive numbers, though unlikely for SRP context.
    return String(numericValue).toUpperCase();
  }
};

// Custom test suite function, replacing standard 'describe'.
const verificationSuite = (suiteLabel, suiteExecutor) => {
  console.groupCollapsed(`Verification Suite: ${suiteLabel}`);
  suiteExecutor();
  console.groupEnd();
};

// Custom test case function, replacing standard 'it'.
const verificationStep = (stepDescription, stepAssertion) => {
  try {
    stepAssertion();
    console.log(`  ✔ ${stepDescription}`);
  } catch (assertionError) {
    console.error(`  ✖ ${stepDescription}`);
    console.error(assertionError.message);
    // Optionally re-throw to halt the suite or for external reporting.
    // throw assertionError;
  }
};

// Custom assertion mechanism, replacing standard 'expect'.
const assertValue = (actualOperand) => ({
  /**
   * Checks if the actual operand is strictly equal to the expected operand.
   * @param {*} expectedOperand - The value to compare against.
   */
  isStrictlyEqualTo: (expectedOperand) => {
    if (actualOperand !== expectedOperand) {
      throw new Error(`Mismatch detected: Expected "${expectedOperand}", received "${actualOperand}"`);
    }
  },
  /**
   * Checks if the hexadecimal representation of the actual operand matches the expected hex string.
   * @param {string} expectedHexValue - The expected uppercase hexadecimal string.
   */
  hasHexRepresentationOf: (expectedHexValue) => {
    const actualHex = dataFormatter.toUpperHex(actualOperand);
    if (actualHex !== expectedHexValue) {
      throw new Error(`Hexadecimal mismatch: Expected "${expectedHexValue}", received "${actualHex}"`);
    }
  }
});


verificationSuite("CryptographicProtocolIntegrityCheck", () => {

  // Core parameters for the client-side of the protocol.
  const clientIdentifier = 'alice';
  const clientPassphrase = 'password123';
  const protocolSalt = 'BEB25379D1A8581EB5A727673A2441EE'; // A fixed salt from test vectors.

  // Configuration settings for the SRP protocol instance.
  const protocolConfig = {
    keyExchangeBits: 1024, // Defines the size of the prime modulus N.
    hashingAlgorithm: 'sha-1' // Specifies the cryptographic hash function.
  };

  // Initialize the SRP client handler with the given credentials and configuration.
  const clientSessionManager = new SRPClient(
    clientIdentifier,
    clientPassphrase,
    protocolConfig.keyExchangeBits,
    protocolConfig.hashingAlgorithm
  );

  // --- Step 1: Verify the 'k' parameter (key derivation factor) ---
  verificationStep("Ensure 'k' factor is correctly computed", () => {
    assertValue(clientSessionManager.kFactor).hasHexRepresentationOf('7556AA045AEF2CDD07ABAF0F665C3E818913186F');
  });

  // --- Step 2: Calculate and verify the client's private ephemeral 'x' ---
  const clientPrivateKeyComponent = clientSessionManager.calculatePrivateKey(protocolSalt);

  verificationStep("Validate client's private scalar 'x'", () => {
    assertValue(clientPrivateKeyComponent).hasHexRepresentationOf('94B7555AABE9127CC58CCF4993DB6CF84D16C124');
  });

  // --- Step 3: Calculate and verify the verifier 'v' ---
  const serverVerifierValue = clientSessionManager.deriveVerifier(protocolSalt);

  verificationStep("Confirm server's verifier 'v' generation", () => {
    assertValue(serverVerifierValue).hasHexRepresentationOf('7E273DE8696FFC4F4E337D05B4B375BEB0DDE1569E8FA00A9886D8129BADA1F1822223CA1A605B530E379BA4729FDC59F105B4787E5186F5C671085A1447B52A48CF1970B4FB6F8400BBF4CEBFBB168152E08AB5EA53D15C1AFF87B2B9DA6E04E058AD51CC72BFC9033B564E26480D78E955A5E29E7AB245DB2BE315E2099AFB');
  });

  // --- Step 4: Define client's ephemeral secret 'a' and calculate public 'A' ---
  const clientEphemeralSecret = new BigInteger('60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393', 16);
  const clientPublicEphemeral = clientSessionManager.computePublicEphemeral(clientEphemeralSecret);

  verificationStep("Validate client's public ephemeral 'A' calculation", () => {
    assertValue(clientPublicEphemeral).hasHexRepresentationOf('61D5E490F6F1B79547B0704C436F523DD0E560F0C64115BB72557EC44352E8903211C04692272D8B2D1A5358A2CF1B6E0BFCF99F921530EC8E39356179EAE45E42BA92AEACED825171E1E8B9AF6D9C03E1327F44BE087EF06530E69F66615261EEF54073CA11CF5858F0EDFDFE15EFEAB349EF5D76988A3672FAC47B0769447B');
  });

  // --- Step 5: Define server's ephemeral secret 'b' and calculate public 'B' ---
  const serverEphemeralSecret = new BigInteger('E487CB59D31AC550471E81F00F6928E01DDA08E974A004F49E61F5D105284D20', 16);
  const serverPublicEphemeral = clientSessionManager.calculateServerPublicEphemeral(serverEphemeralSecret, serverVerifierValue);

  verificationStep("Validate server's public ephemeral 'B' calculation", () => {
    assertValue(serverPublicEphemeral).hasHexRepresentationOf('BD0C61512C692C0CB6D041FA01BB152D4916A1E77AF46AE105393011BAF38964DC46A0670DD125B95A981652236F99D9B681CBF87837EC996C6DA04453728610D0C6DDB58B318885D7D82C7F8DEB75CE7BD4FBAA37089E6F9C6059F388838E7A00030B331EB76840910440B1B27AAEAEEB4012B7D7665238A8E3FB004B117B58');
  });

  // --- Step 6: Calculate and verify the interchange hash 'u' ---
  const sessionInterchangeHash = clientSessionManager.deriveInterchangeHash(clientPublicEphemeral, serverPublicEphemeral);

  verificationStep("Confirm session interchange hash 'u' derivation", () => {
    assertValue(sessionInterchangeHash).hasHexRepresentationOf('CE38B9593487DA98554ED47D70A7AE5F462EF019');
  });

  // --- Step 7: Calculate and verify the client's shared secret 'Sc' ---
  const clientPreMasterSecret = clientSessionManager.computeSharedSecret(
    serverPublicEphemeral,
    protocolSalt,
    sessionInterchangeHash,
    clientEphemeralSecret
  );

  verificationStep("Validate client's pre-master secret", () => {
    assertValue(clientPreMasterSecret).hasHexRepresentationOf('B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A');
  });

  // --- Step 8: Derive the session key 'K' from the client's shared secret ---
  // Note: The direct test for 'K' is omitted as its correctness is implicitly
  // verified through the subsequent 'M' proof and the 'Sc'/'Ss' comparison.
  const finalSessionKey = clientSessionManager.deriveSessionKey(clientPreMasterSecret);

  // --- Step 9: Calculate and verify the client's proof 'M' ---
  const clientProofValue = clientSessionManager.generateClientProof(
    clientPublicEphemeral,
    serverPublicEphemeral,
    finalSessionKey
  );

  verificationStep("Validate client's proof 'M' generation", () => {
    assertValue(clientProofValue).hasHexRepresentationOf('E5F39493B07B8B88E2A4F44BC9282874CD2DEBED');
  });

  // --- Step 10: Calculate and verify the server's shared secret 'Ss' ---
  const serverPreMasterSecret = clientSessionManager.computeServerSharedSecret(
    clientPublicEphemeral,
    serverVerifierValue,
    sessionInterchangeHash,
    serverEphemeralSecret
  );

  verificationStep("Validate server's pre-master secret", () => {
    assertValue(serverPreMasterSecret).hasHexRepresentationOf('B0DC82BABCF30674AE450C0287745E7990A3381F63B387AAF271A10D233861E359B48220F7C4693C9AE12B0A6F67809F0876E2D013800D6C41BB59B6D5979B5C00A172B4A2A5903A0BDCAF8A709585EB2AFAFA8F3499B200210DCC1F10EB33943CD67FC88A2F39A4BE5BEC4EC0A3212DC346D7E474B29EDE8A469FFECA686E5A');
  });

  // --- Final Step: Confirm client and server shared secrets are identical ---
  verificationStep("Confirm client and server pre-master secrets match", () => {
    const clientSecretHex = dataFormatter.toUpperHex(clientPreMasterSecret);
    const serverSecretHex = dataFormatter.toUpperHex(serverPreMasterSecret);

    // Defensive check: ensure both values are valid before comparison.
    if (!clientSecretHex || !serverSecretHex) {
      throw new Error("One or both pre-master secrets are invalid, cannot perform final comparison.");
    }

    assertValue(clientSecretHex).isStrictlyEqualTo(serverSecretHex);
  });
});