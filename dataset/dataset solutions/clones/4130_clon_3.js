'use strict'; // Adhering to strict mode for cleaner code practices.

/**
 * Fetches the raw content from the standard input stream.
 * This function encapsulates the file system access for modularity.
 * @returns {string} The entire content read from /dev/stdin, decoded as UTF-8.
 */
function acquireInputData() {
  // Utilizing Node.js's built-in file system module to synchronously read
  // from the standard input file path.
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * Determines the comparative balance between two numeric totals.
 * This helper function abstracts the logic for generating the comparison message.
 * @param {number} firstTotal - The sum of the first group of numbers.
 * @param {number} secondTotal - The sum of the second group of numbers.
 * @returns {string} A descriptive string indicating the balance: 'Left', 'Right', or 'Balanced'.
 */
function ascertainBalanceCondition(firstTotal, secondTotal) {
  let comparisonVerdict; // Variable to hold the final message.

  // Employing a standard conditional structure to compare the totals.
  if (firstTotal > secondTotal) {
    comparisonVerdict = 'Left'; // The first total is numerically larger.
  } else if (firstTotal < secondTotal) {
    comparisonVerdict = 'Right'; // The second total is numerically larger.
  } else {
    comparisonVerdict = 'Balanced'; // Both totals are equal.
  }
  return comparisonVerdict;
}

/**
 * Orchestrates the entire process: parsing input, performing calculations,
 * and outputting the result.
 * @param {string} rawDataString - The unprocessed input string, expected to contain
 *                                 space-separated numbers on its first line.
 */
function processAndEvaluateNumericInput(rawDataString) {

  // --- Phase 1: Input Extraction and Pre-processing ---

  // Isolate the very first line of the input string, discarding any subsequent lines.
  const primaryLine = rawDataString.split('\n')[0];

  // Break down the primary line into an array of string-based numeric tokens.
  const stringComponentArray = primaryLine.split(' ');

  // --- Phase 2: Input Validation ---

  // Implement a guard clause to ensure the expected number of input components.
  const REQUIRED_COMPONENTS = 4;
  if (stringComponentArray.length !== REQUIRED_COMPONENTS) {
    console.error('Input Error: Expected exactly four space-separated numbers. Found:', stringComponentArray.length);
    // Early exit if input format is incorrect.
    return;
  }

  // Convert each string component into an integer. `parseInt` is used with radix 10 for safety.
  // The `trim()` method handles potential leading/trailing whitespace on individual numbers.
  const numericalValues = stringComponentArray.map(token => parseInt(token.trim(), 10));

  // Secondary validation: Ensure all converted values are indeed valid numbers.
  // The `every()` method checks if all elements satisfy the condition (not NaN).
  const areAllNumeric = numericalValues.every(val => !isNaN(val));

  if (!areAllNumeric) {
    console.error('Input Error: One or more provided values could not be converted to valid numbers.');
    // Abort processing if any non-numeric values are detected.
    return;
  }

  // --- Phase 3: Data Assignment and Calculation ---

  // Use array destructuring for clean assignment of parsed numbers to descriptive variables.
  const [firstNumber, secondNumber, thirdNumber, fourthNumber] = numericalValues;

  // Calculate the first aggregate sum.
  const accumulatedSumA = firstNumber + secondNumber;

  // Calculate the second aggregate sum.
  const accumulatedSumB = thirdNumber + fourthNumber;

  // --- Phase 4: Comparison and Result Output ---

  // Utilize the helper function to get the comparison message.
  const finalResultIndicator = ascertainBalanceCondition(accumulatedSumA, accumulatedSumB);

  // Present the final comparison result to the user via the console.
  console.log(finalResultIndicator);
}

// --- Main Execution Flow ---

// Retrieve the data from the designated input source.
const systemInputContent = acquireInputData();

// Initiate the primary processing function with the obtained input.
processAndEvaluateNumericInput(systemInputContent);