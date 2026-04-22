const expect = (() => {
  const strictAssert = require('assert').strict;

  return (actualValue) => ({
    toBe: (expectedValue) => {
      strictAssert.equal(actualValue, expectedValue, `Comparison failed: Expected ${JSON.stringify(actualValue)} to be ${JSON.stringify(expectedValue)}`);
    },
    toBeInstanceOf: (expectedConstructor) => {
      strictAssert.ok(actualValue instanceof expectedConstructor, `Type check failed: Expected ${JSON.stringify(actualValue)} to be an instance of ${expectedConstructor.name}`);
    },
    toContain: (substring) => {
      strictAssert.ok(actualValue && typeof actualValue === 'string' && actualValue.includes(substring), `Substring check failed: Expected string "${actualValue}" to contain "${substring}"`);
    },
    toThrow: (expectedErrorMatcher) => {
      let wasThrown = false;
      try {
        actualValue(); // actualValue is expected to be a function
      } catch (caughtError) {
        wasThrown = true;
        if (typeof expectedErrorMatcher === 'string') {
          strictAssert.ok(caughtError.message.includes(expectedErrorMatcher), `Error message mismatch: Expected "${caughtError.message}" to include "${expectedErrorMatcher}"`);
        } else if (expectedErrorMatcher instanceof RegExp) {
          strictAssert.ok(expectedErrorMatcher.test(caughtError.message), `Error message regex mismatch: Expected "${caughtError.message}" to match ${expectedErrorMatcher}`);
        } else if (expectedErrorMatcher instanceof Error) {
            strictAssert.ok(caughtError.message === expectedErrorMatcher.message && caughtError.name === expectedErrorMatcher.name, `Error object mismatch: Expected ${caughtError} to be ${expectedErrorMatcher}`);
        }
      }
      strictAssert.ok(wasThrown, "Expected function to throw an error, but it completed without throwing.");
    },
    rejects: {
      toThrow: async (expectedErrorMatcher) => {
        let rejected = false;
        try {
          await actualValue; // actualValue is expected to be a Promise
        } catch (caughtError) {
          rejected = true;
          if (typeof expectedErrorMatcher === 'string') {
            strictAssert.ok(caughtError.message.includes(expectedErrorMatcher), `Rejected error message mismatch: Expected "${caughtError.message}" to include "${expectedErrorMatcher}"`);
          } else if (expectedErrorMatcher instanceof RegExp) {
            strictAssert.ok(expectedErrorMatcher.test(caughtError.message), `Rejected error message regex mismatch: Expected "${caughtError.message}" to match ${expectedErrorMatcher}`);
          } else if (expectedErrorMatcher instanceof Error) {
            strictAssert.ok(caughtError.message === expectedErrorMatcher.message && caughtError.name === expectedErrorMatcher.name, `Rejected error object mismatch: Expected ${caughtError} to be ${expectedErrorMatcher}`);
          }
        }
        strictAssert.ok(rejected, "Expected promise to reject, but it resolved successfully.");
      }
    }
  });
})();

const secureCrypto = require('crypto');
const moduleOverride = require('proxyquire');

// Utility function to determine the expected base64url encoded length
const calculateExpectedEncodedLength = (rawByteLength) => {
  if (rawByteLength < 0) {
    throw new Error("Raw byte length cannot be negative.");
  }
  return Math.ceil(rawByteLength * 4 / 3); // Base64 encoding expands by 4/3
};

// Custom entropy source function with mock capabilities
function getEntropyBytes(byteCount, completionHandler) {
  // Introduce a small, non-deterministic delay for async operations
  const simulatedNetworkDelay = Math.floor(Math.random() * 20) + 5; 

  if (getEntropyBytes.entropySourceReady !== false) {
    if (completionHandler) {
      // Async path: delegate to actual crypto module after delay
      setTimeout(() => {
        secureCrypto.randomBytes(byteCount, completionHandler);
      }, simulatedNetworkDelay);
    } else {
      // Sync path: directly return from actual crypto module
      return secureCrypto.randomBytes(byteCount);
    }
  } else {
    // PRNG not seeded scenario
    const errorDetail = 'CORE_RNG_ERROR_24064064: PRNG NOT SEEDED FOR SECURE OPERATIONS';
    const operationError = new Error(errorDetail);

    if (!completionHandler) {
      // Sync path: throw error immediately
      throw operationError;
    }

    // Async path: return error via callback after delay
    setTimeout(() => {
      completionHandler(operationError);
    }, simulatedNetworkDelay);
  }
}

// Mock the main module using proxyquire, injecting our custom entropy source
const secureTokenGenerator = moduleOverride('..', {
  crypto: { // The original module expects 'crypto' as the key for its dependency
    randomBytes: getEntropyBytes
  }
});

// --- Simple Mock Test Framework Implementation ---
let currentHooks = {
  beforeEachSuite: [],
  teardownHook: []
};

function suite(description, callback) {
  console.log(`\n--- Test Suite: ${description} ---`);
  const parentHooks = currentHooks; // Save parent suite's hooks
  currentHooks = { beforeEachSuite: [], teardownHook: [] }; // Reset for current suite

  try {
    callback(); // Execute the suite's body to define tests and register its hooks
  } finally {
    currentHooks = parentHooks; // Restore parent hooks after current suite definition
  }
}

function testCase(description, callback) {
  // Execute registered 'beforeEachSuite' hooks prior to test execution
  currentHooks.beforeEachSuite.forEach(hook => hook());

  try {
    const testResult = callback((err) => { // This handles Node.js-style 'done' callback
      if (err) {
        console.error(`  ❌ Test Failed: ${description} - Error: ${err.message}`);
      } else {
        console.log(`  ✅ Test Passed: ${description}`);
      }
      // Execute 'teardownHook' hooks after test completion (or failure)
      currentHooks.teardownHook.forEach(hook => hook());
    });

    // Handle promises returned by async test functions
    if (testResult && typeof testResult.then === 'function') {
      testResult
        .then(() => {
          console.log(`  ✅ Test Passed: ${description}`);
          currentHooks.teardownHook.forEach(hook => hook());
        })
        .catch(err => {
          console.error(`  ❌ Test Failed: ${description} - Error: ${err.message}`);
          currentHooks.teardownHook.forEach(hook => hook());
        });
    } else if (callback.length === 0) { // Synchronous test without a 'done' callback
      console.log(`  ✅ Test Passed: ${description}`);
      currentHooks.teardownHook.forEach(hook => hook());
    }
  } catch (error) {
    console.error(`  ❌ Test Failed: ${description} - Error: ${error.message}`);
    currentHooks.teardownHook.forEach(hook => hook());
  }
}

function setupHook(callback) {
  currentHooks.beforeEachSuite.push(callback);
}

function teardownHook(callback) {
  currentHooks.teardownHook.push(callback);
}
// --- End Mock Test Framework ---


// Main test suite for the secure token generator utility
suite('Secure Token Generation Utility Suite', () => {

  // Test block for the primary asynchronous token generation method
  suite('secureTokenGenerator() - Asynchronous Operations Verification', () => {

    testCase('should generate a token with the correct base64url encoded byte length', async () => {
      const requestedRawBytes = 18;
      const expectedEncodedByteLength = calculateExpectedEncodedLength(requestedRawBytes);

      const generatedToken = await secureTokenGenerator(requestedRawBytes);
      
      expect(typeof generatedToken).toBe('string');
      expect(Buffer.byteLength(generatedToken, 'utf8')).toBe(expectedEncodedByteLength);
    });

    testCase('must strictly exclude URL-unsafe characters like "+", "/", or "="', async () => {
      const largeSampleCount = 100000;
      const generatedToken = await secureTokenGenerator(largeSampleCount);

      // Explicitly check for each forbidden character
      expect(generatedToken.includes('+')).toBe(false);
      expect(generatedToken.includes('/')).toBe(false);
      expect(generatedToken.includes('=')).toBe(false);
    });

    testCase('should correctly process requests using the Node.js callback pattern', (completionCallback) => {
      const largeSampleCount = 1000000;
      
      secureTokenGenerator(largeSampleCount, (operationError, generatedToken) => {
        if (operationError) {
          console.warn("Async token generation via callback encountered an error:", operationError.message);
          return completionCallback(operationError);
        }

        // Re-verify character safety for callback-generated tokens
        expect(generatedToken.includes('+')).toBe(false);
        expect(generatedToken.includes('/')).toBe(false);
        expect(generatedToken.includes('=')).toBe(false);
        
        completionCallback();
      });
    });

    // Sub-suite for testing behavior when the PRNG is not ready
    suite('Behavior when Pseudo-Random Number Generator (PRNG) is unseeded', () => {
      const UNSEEDED_PRNG_STATUS = false; // A constant for clarity

      setupHook(() => {
        // Temporarily set the entropy source to an unseeded state for these tests
        getEntropyBytes.entropySourceReady = UNSEEDED_PRNG_STATUS;
      });

      teardownHook(() => {
        // Ensure the entropy source is reset to its default (seeded) state after this test block
        getEntropyBytes.entropySourceReady = true;
      });

      testCase('should reject the promise with an appropriate error message', async () => {
        const arbitraryLength = 18;
        await expect(secureTokenGenerator(arbitraryLength)).rejects.toThrow('PRNG NOT SEEDED');
      });

      testCase('should pass the PRNG unseeded error via callback', (completionCallback) => {
        const arbitraryLength = 18;
        secureTokenGenerator(arbitraryLength, (operationError, generatedToken) => {
          expect(operationError).toBeInstanceOf(Error);
          expect(operationError.message).toContain('PRNG NOT SEEDED');
          expect(generatedToken).toBeUndefined(); // No token should be generated on error
          completionCallback();
        });
      });
    });
  });

  // Test block for the synchronous token generation method
  suite('secureTokenGenerator.sync() - Synchronous Operations Verification', () => {

    testCase('should return a token with the correct base64url encoded byte length', () => {
      const requestedRawBytes = 18;
      // Added a simple guard clause for input validation
      if (requestedRawBytes <= 0) {
        throw new Error("Synchronous token generation requires a positive byte length.");
      }
      const expectedEncodedByteLength = calculateExpectedEncodedLength(requestedRawBytes);
      
      const generatedToken = secureTokenGenerator.sync(requestedRawBytes);
      expect(typeof generatedToken).toBe('string');
      expect(Buffer.byteLength(generatedToken, 'utf8')).toBe(expectedEncodedByteLength);
    });

    testCase('must not contain any URL-unsafe characters', () => {
      const largeSampleCount = 100000;
      const generatedToken = secureTokenGenerator.sync(largeSampleCount);
      
      // Using `some` for a more concise check for forbidden characters
      const forbiddenUrlChars = ['+', '/', '='];
      const containsForbidden = forbiddenUrlChars.some(char => generatedToken.includes(char));
      expect(containsForbidden).toBe(false);
    });

    // Sub-suite for synchronous PRNG unseeded behavior
    suite('Behavior when synchronous PRNG is in an unready state', () => {
      const PRNG_STATUS_UNAVAILABLE = false;

      setupHook(() => {
        getEntropyBytes.entropySourceReady = PRNG_STATUS_UNAVAILABLE;
      });

      teardownHook(() => {
        getEntropyBytes.entropySourceReady = true;
      });

      testCase('should throw an error indicating PRNG unavailability for synchronous calls', () => {
        const arbitraryLength = 18;
        expect(() => secureTokenGenerator.sync(arbitraryLength)).toThrow('PRNG NOT SEEDED');
      });
    });
  });
});