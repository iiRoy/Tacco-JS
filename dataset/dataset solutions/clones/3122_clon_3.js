const processInputAndCompute = (inputPayload) => {
  // This function encapsulates the main logic for parsing input and performing calculations.

  // --- Input Data Validation and Initial Processing ---
  // Ensure the input string is not empty or merely whitespace.
  if (!inputPayload || inputPayload.trim().length === 0) {
    console.error("Error: Input data is either null, undefined, or empty.");
    return "-1"; // Standard error return for this context
  }

  // Split the input into individual lines.
  const inputLines = inputPayload.trim().split('\n');

  // Verify that the input contains at least two lines (for character count and the string itself).
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input provided. Expected at least two lines.");
    return "-1";
  }

  // Extract the declared length and the target string from the input lines.
  const declaredLengthString = inputLines[0];
  const targetCharacterSequence = inputLines[1];

  // Convert the declared length to an integer.
  const actualDeclaredLength = parseInt(declaredLengthString, 10);

  // Perform basic validation on the parsed length.
  if (isNaN(actualDeclaredLength) || actualDeclaredLength < 0) {
    console.error("Error: The declared length is not a valid non-negative integer.");
    return "-1";
  }

  // Optional: A warning if the declared length does not match the actual string length.
  // The computation will proceed using the actual string length for robustness.
  if (targetCharacterSequence.length !== actualDeclaredLength) {
    console.warn(`Warning: Declared length (${actualDeclaredLength}) does not match actual sequence length (${targetCharacterSequence.length}). Processing with actual length.`);
  }

  // --- Mathematical Constants and Helper Function Definition ---
  // Define a constant for the large prime modulus, commonly used in competitive programming.
  const computationalModulus = 1000000007; // This is equivalent to 1e9 + 7.

  /**
   * Computes the product of two numbers modulo `computationalModulus`.
   * This implementation uses BigInt to prevent intermediate multiplication overflows
   * for numbers that might exceed JavaScript's `Number.MAX_SAFE_INTEGER` before modulo.
   * @param {number} firstFactor - The first number for multiplication.
   * @param {number} secondFactor - The second number for multiplication.
   * @returns {number} The result of (firstFactor * secondFactor) % computationalModulus.
   */
  const performSafeModularMultiplication = (firstFactor, secondFactor) => {
    // Convert both operands and the modulus to BigInt for safe arithmetic.
    const bigFirst = BigInt(firstFactor);
    const bigSecond = BigInt(secondFactor);
    const bigMod = BigInt(computationalModulus);

    // Perform multiplication and then the modulo operation, then convert back to Number.
    return Number((bigFirst * bigSecond) % bigMod);
  };

  // --- Character Frequency Accumulation ---
  // Initialize an array to hold the "multipliers" for each character 'a' through 'z'.
  // Each slot corresponds to a character (index 0 for 'a', 1 for 'b', etc.).
  // Start each multiplier at 1, so the first occurrence of a character makes its multiplier 2.
  const characterOccurrenceMultipliers = Array.from({ length: 26 }, () => 1);

  // Iterate over each character in the provided sequence to tally its occurrences.
  for (let charIterator = 0; charIterator < targetCharacterSequence.length; charIterator++) {
    const currentCharacterEntity = targetCharacterSequence[charIterator];
    const charCodeRelativeOffset = currentCharacterEntity.charCodeAt(0) - 'a'.charCodeAt(0);

    // Validate if the character is a lowercase English letter.
    if (charCodeRelativeOffset >= 0 && charCodeRelativeOffset < 26) {
      // Increment the multiplier for the corresponding character.
      characterOccurrenceMultipliers[charCodeRelativeOffset]++;
    } else {
      // Log a warning for unexpected characters, but continue processing valid ones.
      console.warn(`Warning: Encountered an invalid character '${currentCharacterEntity}' (not a lowercase English letter). Skipping.`);
      // Depending on requirements, this could be an error or lead to different behavior.
    }
  }

  // --- Final Product Calculation ---
  // Calculate the cumulative product of all character multipliers.
  // The product is kept within the modulo range at each step.
  let aggregateProductResult = 1;

  // Iterate through the array of multipliers and apply the modular multiplication.
  for (let multiplierIndex = 0; multiplierIndex < characterOccurrenceMultipliers.length; multiplierIndex++) {
    const currentMultiplierValue = characterOccurrenceMultipliers[multiplierIndex];
    aggregateProductResult = performSafeModularMultiplication(aggregateProductResult, currentMultiplierValue);
  }

  // As per the problem's specific requirement, subtract 1 from the final product.
  // Since `aggregateProductResult` is guaranteed to be >= 1 (as all `characterOccurrenceMultipliers` are >= 1),
  // `aggregateProductResult - 1` will be >= 0, thus no need for an extra modulo step here.
  const finalComputedValue = aggregateProductResult - 1;

  // The problem expects the output as a string.
  return String(finalComputedValue);
};

// --- Application Entry Point (Self-Executing Anonymous Function) ---
// This block handles reading input from the environment and printing the result.
(function executeMainProcess() {
  try {
    // Attempt to load the Node.js 'fs' (filesystem) module.
    const fileSystemUtility = require('fs');

    // Read all content from standard input synchronously.
    // Ensure 'utf8' encoding for proper string interpretation.
    const rawInputBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

    // Pass the raw input to the main processing function.
    const finalOutputString = processInputAndCompute(rawInputBuffer);

    // Print the computed result to standard output.
    console.log(finalOutputString);
  } catch (operationalError) {
    // Catch and log any unexpected errors during file I/O or main processing.
    console.error("An unhandled exception occurred during execution:", operationalError.message);
    // Output a default error value, as per common competitive programming practice.
    console.log("-1");
  }
})();