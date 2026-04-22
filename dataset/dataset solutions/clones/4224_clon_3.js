/**
 * @file This script solves a specific arithmetic puzzle: given a sequence of four single digits,
 * it attempts to insert '+' or '-' operators between them to achieve a target sum of 7.
 * For example, if the input is "1234", it might find "1+2+3+1=7" (not for this example, but demonstrates the goal).
 *
 * This is a Type III clone of an existing JavaScript program, meaning
 * identifiers are renamed, data types are adjusted, comments are rewritten,
 * and structural changes like additions, deletions, and updates are applied
 * while preserving the core functionality.
 */

// Define constants for key magic numbers for better readability and maintainability.
const REQUIRED_DIGIT_COUNT = 4; // The fixed number of digits expected in the input sequence.
const FINAL_TARGET_SUM = 7;     // The specific sum the expression must evaluate to.

/**
 * Main function to process the input string and solve the equation puzzle.
 *
 * @param {string} rawInputSequence - The raw string containing the sequence of digits (e.g., "1234").
 */
function EquationSolver(rawInputSequence) {
  // Convert the input string into an array of individual digit characters.
  // Type II: Renamed 'inputs' to 'digitChars'.
  const digitChars = Array.from(rawInputSequence);

  // Type III: Added a guard clause to validate the input length.
  if (digitChars.length !== REQUIRED_DIGIT_COUNT) {
    console.error(
      `Error: Input must contain exactly ${REQUIRED_DIGIT_COUNT} digits. Received ${digitChars.length}.`
    );
    return; // Exit if the input is invalid.
  }

  // This array will store the operators found for the final expression.
  // `appliedOperators[i]` will hold the operator placed before `digitChars[i]`.
  // Note: `appliedOperators[0]` will be populated but not used in the final output string format.
  // Type II: Renamed 'a' to 'appliedOperators'.
  // Type III: Initialized with a fixed size for clarity, though dynamic growth is also possible.
  const appliedOperators = new Array(REQUIRED_DIGIT_COUNT);

  /**
   * Recursive backtracking function to explore combinations of operators.
   * It attempts to find a sequence of '+' or '-' that makes the expression
   * `digitChars[0] op1 digitChars[1] op2 digitChars[2] op3 digitChars[3]` equal to FINAL_TARGET_SUM.
   *
   * The `desiredPartialSum` parameter represents the sum that the *remaining* digits
   * (from `currentDigitsRemaining - 1` down to `0`) need to evaluate to.
   *
   * @param {number} currentDigitsRemaining - The count of digits left to process (from right to left).
   *                                        Starts at `REQUIRED_DIGIT_COUNT` and decrements to `0`.
   * @param {number} desiredPartialSum - The sum that the current segment of the expression needs to achieve.
   * @returns {boolean} True if a valid combination is found for the current path, false otherwise.
   */
  function findOperatorCombination(currentDigitsRemaining, desiredPartialSum) {
    // Base case: If all digits have been processed (no digits left).
    if (currentDigitsRemaining === 0) {
      // Type III: Explicitly return a boolean based on whether the desired sum is met.
      return desiredPartialSum === 0;
    }

    // Determine the index of the current digit being considered in the `digitChars` array.
    // We process digits from right to left, so `currentDigitsRemaining - 1` gives the correct index.
    // Type III: Extracted `currentDigitIndex` for improved readability.
    const currentDigitIndex = currentDigitsRemaining - 1;

    // Convert the character digit to an integer.
    // Type II: Used `parseInt()` for explicit type conversion, replacing `new Number()`.
    const digitValue = parseInt(digitChars[currentDigitIndex], 10);

    // --- Option 1: Try placing a '+' operator before the current digit. ---
    // If we place a '+' before `digitValue`, it means `digitValue` contributes positively
    // to the total sum. Therefore, the *remaining* part of the expression (to the left)
    // must achieve `desiredPartialSum - digitValue`.
    if (findOperatorCombination(currentDigitsRemaining - 1, desiredPartialSum - digitValue)) {
      appliedOperators[currentDigitIndex] = "+"; // Store the operator for this position.
      return true; // Found a solution path.
    }

    // --- Option 2: Try placing a '-' operator before the current digit. ---
    // If we place a '-' before `digitValue`, it means `digitValue` contributes negatively
    // to the total sum. Therefore, the *remaining* part of the expression (to the left)
    // must achieve `desiredPartialSum + digitValue`.
    // Type II: Removed redundant '== true'.
    if (findOperatorCombination(currentDigitsRemaining - 1, desiredPartialSum + digitValue)) {
      appliedOperators[currentDigitIndex] = "-"; // Store the operator for this position.
      return true; // Found a solution path.
    }

    // If neither adding nor subtracting the current digit leads to the desired sum,
    // then this particular path does not yield a solution.
    return false;
  }

  // Initiate the search for operator combinations.
  // We start with all digits (`REQUIRED_DIGIT_COUNT`) and the `FINAL_TARGET_SUM`.
  // Type II: Renamed `Func` to `findOperatorCombination`.
  // Type III: Used constants for initial parameters.
  if (findOperatorCombination(REQUIRED_DIGIT_COUNT, FINAL_TARGET_SUM)) {
    // If a solution is found, construct and display the resulting equation.
    // The output format requires operators `appliedOperators[1]`, `appliedOperators[2]`, `appliedOperators[3]`.
    // `digitChars[0]` is implicitly positive and does not have a leading operator.
    // Type III: Used template literals for cleaner string construction.
    const finalExpression = `${digitChars[0]}${appliedOperators[1]}${digitChars[1]}${appliedOperators[2]}${digitChars[2]}${appliedOperators[3]}${digitChars[3]}=${FINAL_TARGET_SUM}`;
    console.log(finalExpression);
  } else {
    // If no combination of operators yields the target sum.
    // Type III: Provided a more descriptive message for failure.
    console.log(`No valid operator sequence found for '${rawInputSequence}' to equal ${FINAL_TARGET_SUM}.`);
  }
}

// --- Input Handling and Program Execution ---
// Type III: Encapsulated input reading and execution in a try-catch block for robustness.
// This block reads input from standard input, typically used in competitive programming environments.
try {
  // Read the entire content of the standard input stream as a UTF-8 string.
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the trimmed input data (removing any leading/trailing whitespace, like newlines)
  // to the main equation solver function.
  EquationSolver(inputData.trim());
} catch (error) {
  // Type III: Added specific error handling for input reading failures.
  console.error("Failed to read input from /dev/stdin:", error.message);
  // Optionally, exit with a non-zero status code to indicate an error.
  process.exit(1);
}