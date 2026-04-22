// Define a comprehensive pool of characters for custom identifier generation.
// This set includes alphanumeric characters, carefully chosen to avoid ambiguity.
const encodingCharacterPool = "zyxw87654321vutsrQpOnMLkjIhGFEdCBAbcdefg90";

/**
 * Orchestrates the creation and verification of obfuscated numerical identifiers.
 * This function encapsulates the process of encoding a sequence of numbers into a unique string
 * and subsequently decoding it back to its original components, ensuring data integrity.
 *
 * @param {Array<number>} numericSequence - An array of integer values to be encoded.
 * @param {string} masterSecretKey - A unique string used as a salt for the encoding algorithm.
 * @param {number} minimumOutputTokenLength - The desired minimum length of the generated identifier string.
 * @returns {object|null} An object containing the encoded string and decoded array, or null if input is invalid.
 */
function manageIdentifierTransformation(numericSequence, masterSecretKey, minimumOutputTokenLength) {
  // --- Input Validation ---
  // Ensure the provided sequence is a valid, non-empty array of numbers.
  if (!Array.isArray(numericSequence) || numericSequence.length === 0 || !numericSequence.every(num => typeof num === 'number' && Number.isInteger(num))) {
    console.error("Error: The input 'numericSequence' must be a non-empty array of integers.");
    return null; // Terminate operation due to invalid input.
  }

  // --- Initialization of Encoding Mechanism ---
  // Instantiate the Hashids engine with our specific configuration.
  // The 'masterSecretKey' provides cryptographic entropy, 'minimumOutputTokenLength'
  // enforces output format, and 'encodingCharacterPool' defines the character set.
  const obfuscationEngine = new Hashids(masterSecretKey, minimumOutputTokenLength, encodingCharacterPool);

  // --- Encoding Phase ---
  // Transform the array of numbers into a single, compact, and obfuscated string.
  // The 'encode' method expects individual arguments, so the spread operator is crucial here.
  const generatedCompositeKey = obfuscationEngine.encode(...numericSequence);

  // Provide immediate feedback on the result of the encoding operation.
  console.log(`\n[ENCODING] Original numeric input: ${JSON.stringify(numericSequence)}`);
  console.log(`[ENCODING] Successfully generated composite key: "${generatedCompositeKey}"`);

  // --- Decoding Phase ---
  // Reconstruct the original numerical components from the generated composite key.
  const retrievedComponents = obfuscationEngine.decode(generatedCompositeKey);

  // --- Integrity Verification ---
  // A crucial step: compare the original input with the decoded output to confirm accuracy.
  const isDecodingSuccessful = retrievedComponents.length === numericSequence.length &&
                               retrievedComponents.every((val, idx) => val === numericSequence[idx]);

  if (isDecodingSuccessful) {
    console.info(`[DECODING] Verification successful! Decoded sequence matches original: ${JSON.stringify(retrievedComponents)}`);
  } else {
    console.warn(`[DECODING] WARNING: Data mismatch detected after decoding!`);
    console.warn(`[DECODING] Expected: ${JSON.stringify(numericSequence)}, Received: ${JSON.stringify(retrievedComponents)}`);
  }

  // Return an object containing both the encoded and decoded results for further use.
  return {
    obfuscatedKey: generatedCompositeKey,
    unpackedComponents: retrievedComponents
  };
}


// --- Main Execution Block ---

// Define the primary set of numerical entities to be processed.
let initialNumericSet = [101, 202, 303, 404, 505];

// Specify a unique and robust secret phrase for this particular application context.
const applicationSecret = "my_super_secure_application_salt_string_v3.0";

// Establish the minimum acceptable length for the resulting encoded identifier.
const requiredKeyLength = 12;

// Initiate the identifier transformation process.
const processingOutcome = manageIdentifierTransformation(initialNumericSet, applicationSecret, requiredKeyLength);

// Output a final summary based on the operation's success or failure.
if (processingOutcome && processingOutcome.obfuscatedKey && processingOutcome.unpackedComponents) {
  console.log("\n--- FINAL REPORT ---");
  console.log(`The final generated obfuscated key is: "${processingOutcome.obfuscatedKey}"`);
  console.log(`The fully reconstituted numerical array is: ${JSON.stringify(processingOutcome.unpackedComponents)}`);
} else {
  console.error("\n--- OPERATION CRITICAL FAILURE ---");
  console.error("The identifier transformation process did not complete as expected.");
}

// --- Demonstrate handling of edge cases (e.g., empty input) ---
// console.log("\n--- Testing with an empty input array ---");
// manageIdentifierTransformation([], "empty_test_salt", 5);

// console.log("\n--- Testing with invalid input type ---");
// manageIdentifierTransformation("not an array", "invalid_test_salt", 5);