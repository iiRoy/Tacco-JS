/**
 * A robust utility function for calculating modular exponentiation (base^exponent % mod).
 * This is crucial for handling potentially very large intermediate numbers in modular arithmetic
 * without overflowing standard number types, and replaces the general-purpose Math.pow.
 *
 * @param {number} base - The base number.
 * @param {number} exponent - The exponent.
 * @param {number} mod - The modulus. Must be a positive integer.
 * @returns {number} The result of (base^exponent) % mod.
 * @throws {Error} If base or exponent are negative, or mod is not positive.
 */
function calculateModularPower(base, exponent, mod) {
  // Ensure inputs are valid for modular exponentiation.
  if (base < 0 || exponent < 0 || mod <= 0) {
    throw new Error("Invalid arguments for calculateModularPower: base and exponent must be non-negative, modulus must be positive.");
  }

  let resultAccumulator = 1; // Initialize result to 1 (base^0)
  base %= mod; // Normalize the base to be within the modulo range

  // Iterate while the exponent is greater than zero, using binary exponentiation (exponentiation by squaring).
  while (exponent > 0) {
    // If the current bit of the exponent is 1 (i.e., exponent is odd),
    // multiply the current result with the base.
    if (exponent % 2 === 1) {
      resultAccumulator = (resultAccumulator * base) % mod;
    }

    // Square the base and take modulo, preparing for the next bit of the exponent.
    base = (base * base) % mod;
    // Halve the exponent (integer division).
    exponent = Math.floor(exponent / 2);
  }
  return resultAccumulator;
}

/**
 * Processes raw input data to compute a specific product sequence based on number frequencies.
 * The core logic involves calculating (frequency[n-1] ^ frequency[n]) for a range of numbers,
 * applying a modulo at each step, and has an early exit if any required number is missing.
 *
 * @param {string[]} problemInputLines - An array of strings where:
 *                                       - problemInputLines[0] is expected to be an integer (number of elements, currently unused).
 *                                       - problemInputLines[1] is a space-separated string of integers.
 */
function computeFrequencyProduct(problemInputLines) {
  // Define a constant for the modulo value to improve readability and maintainability.
  const ARITHMETIC_MODULUS = 998244353;

  // --- Input Validation and Pre-processing ---
  // A basic check to ensure the input structure is as expected.
  if (!Array.isArray(problemInputLines) || problemInputLines.length < 2) {
    console.error("Error: Input data is malformed or incomplete. Expected at least two lines.");
    // In a real application, one might throw an error or return a specific error code.
    return;
  }

  // The first line often contains a count of elements, but its value is not used
  // in the current calculation logic. This is a deliberate deletion of non-essential code.
  // const totalInputNumbers = parseInt(problemInputLines[0], 10);
  // if (isNaN(totalInputNumbers) || totalInputNumbers < 0) { /* Handle invalid count */ }

  // Split the second line of input into individual number strings.
  const numericStringTokens = problemInputLines[1].split(" ");

  // A map to store the frequency (count) of each number encountered.
  let observedNumberCounts = {};
  // Tracks the largest number found in the input, which defines the upper bound for our loop.
  let maximumObservedNumber = 0;

  // --- Populate Frequencies and Determine Max Value ---
  // Iterate through each string token to parse and count numbers.
  for (const token of numericStringTokens) {
    const currentParsedValue = parseInt(token, 10);

    // Validate the parsed number: skip if not a valid non-negative integer.
    // This adds robustness against malformed input data.
    if (isNaN(currentParsedValue) || currentParsedValue < 0) {
      // Depending on requirements, could log a warning or throw an error here.
      continue;
    }

    // Increment the count for the current number.
    // Uses the logical OR assignment pattern for concise incrementing.
    observedNumberCounts[currentParsedValue] = (observedNumberCounts[currentParsedValue] || 0) + 1;

    // Update the highest number encountered so far.
    if (currentParsedValue > maximumObservedNumber) {
      maximumObservedNumber = currentParsedValue;
    }
  }

  // --- Execute Core Calculation Loop ---
  let finalCalculatedProduct = 1; // Initialize the product.

  // The loop iterates from 1 up to the maximum observed number.
  // This structure ensures that all relevant pairs (i-1, i) are considered.
  for (let currentNumberIndex = 1; currentNumberIndex <= maximumObservedNumber; currentNumberIndex++) {
    // Retrieve the frequency of the number immediately preceding the current one.
    // Defaults to 0 if the number (currentNumberIndex - 1) was not present in the input.
    const countOfPreviousNumber = observedNumberCounts[currentNumberIndex - 1] || 0;

    // Retrieve the frequency of the current number.
    // Defaults to 0 if the number (currentNumberIndex) was not present.
    const countOfCurrentNumber = observedNumberCounts[currentNumberIndex] || 0;

    // --- Critical Early Exit Condition ---
    // If the current number (currentNumberIndex) has a frequency of 0, it means
    // it was not present in the input. According to the problem's implicit rules
    // (derived from the original code's `if(map[i]||0 == 0) ans = 0;`),
    // the entire product becomes 0 in this scenario. This is an added early exit for efficiency.
    if (countOfCurrentNumber === 0) {
      finalCalculatedProduct = 0;
      break; // No further calculations are needed.
    }

    // Calculate the power term: (countOfPreviousNumber ^ countOfCurrentNumber) modulo ARITHMETIC_MODULUS.
    // Utilizes the custom calculateModularPower function for modular exponentiation.
    const currentTermResult = calculateModularPower(countOfPreviousNumber, countOfCurrentNumber, ARITHMETIC_MODULUS);

    // Multiply the current term into the cumulative product and apply the modulo.
    finalCalculatedProduct = (finalCalculatedProduct * currentTermResult) % ARITHMETIC_MODULUS;
  }

  // --- Output the Final Result ---
  console.log(finalCalculatedProduct);
}

// --- Program Entry Point and Input Handling ---
// This block handles reading input from standard input, which is common in competitive programming.
// A `try...catch` block is added for robust error handling during file operations.
try {
  // Read the entire file content from `/dev/stdin` (standard input).
  const rawFileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Split the content into an array of lines.
  const inputLinesArray = rawFileContents.split("\n");
  // Invoke the main processing function with the parsed input.
  computeFrequencyProduct(inputLinesArray);
} catch (ioError) {
  // Log specific errors related to input/output operations or file reading.
  console.error("An error occurred during input processing:", ioError.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}