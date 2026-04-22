'use strict' // Enforce strict parsing and error handling for cleaner code

// Alias for the Node.js file system module, enhancing readability and modularity.
const systemIOHandler = require('fs');

/**
 * Parses an arithmetic expression string containing positive integers and '+' operators,
 * then calculates its numerical value. This function replaces the use of 'eval'
 * for enhanced security, predictability, and explicit control over evaluation logic.
 *
 * @param {string} arithmeticExpression A string like "1+23+4" representing an addition problem.
 * @returns {number} The computed sum of the expression. Returns 0 for invalid/empty input.
 */
function computeNumericExpression(arithmeticExpression) {
  // Input validation: Ensure the expression is a non-empty string.
  // If not, it suggests an issue in expression generation or initial input.
  if (typeof arithmeticExpression !== 'string' || arithmeticExpression.trim().length === 0) {
    // In a production system, an error might be thrown here for robust error handling.
    // For this context, we return 0 as a default for non-processable expressions.
    console.error("Error: An empty or non-string expression was provided for evaluation.");
    return 0;
  }

  // Split the expression string into individual number parts using the '+' delimiter.
  const termStrings = arithmeticExpression.split('+');

  let accumulatedValue = 0; // Initialize a variable to store the running total.

  // Iterate over each string segment (term), convert it to a number, and add it.
  for (let termIndex = 0; termIndex < termStrings.length; termIndex++) {
    const currentTermString = termStrings[termIndex].trim(); // Clean up any whitespace.

    // Attempt to convert the string term into a numerical value.
    const numericTerm = Number(currentTermString);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(numericTerm)) {
      // If a term is not a number (e.g., due to malformed input or an empty string from "++"),
      // log a warning and skip it, or handle it as an error based on requirements.
      console.warn(`Warning: Encountered non-numeric term '${currentTermString}' in expression '${arithmeticExpression}'. Skipping.`);
      continue; // Move to the next term.
    }
    accumulatedValue += numericTerm; // Add the valid numeric term to the total.
  }

  return accumulatedValue; // Return the final sum of the expression.
}


// --- Main Application Logic ---

// Read the entire content from standard input (file descriptor 0) as UTF-8 text.
const rawContentFromInput = systemIOHandler.readFileSync(0, 'utf8');

// Process the raw input by splitting it into an array of individual lines.
const inputLineSegments = rawContentFromInput.split('\n');

// The primary sequence of digits is expected on the first line of input.
const digitSequenceForProcessing = inputLineSegments[0];

// Pre-computation validation: Check if the input digit sequence is valid.
// An empty or undefined sequence cannot form any expressions.
if (!digitSequenceForProcessing || digitSequenceForProcessing.length === 0) {
  console.log(0); // If no digits, the sum of expressions is 0.
  process.exit(0); // Terminate the program gracefully.
}

// Calculate the index of the last digit in the sequence. This is a critical
// boundary condition for the recursive exploration.
const finalDigitPosition = digitSequenceForProcessing.length - 1;

/**
 * A recursive function to explore all possible ways to insert '+' operators
 * into a sequence of digits and sum the results of all valid expressions formed.
 * This is analogous to a Depth-First Search (DFS) through the expression tree.
 *
 * @param {number} currentScanningIndex The current index within the digitSequence being considered.
 * @param {string} currentExpressionFragment The string representing the expression built so far in this recursive path.
 * @returns {number} The aggregate sum of all possible valid expressions that can be generated
 *                   from the `currentScanningIndex` to the end of the digit sequence.
 */
function exploreAndSumAllCombinations(currentScanningIndex, currentExpressionFragment) {
  // Base Case: When the current index reaches the final digit.
  // This means all digits have been processed, and a complete expression is formed.
  if (currentScanningIndex === finalDigitPosition) {
    const completeExpressionString = currentExpressionFragment + digitSequenceForProcessing[finalDigitPosition];
    // Evaluate the final expression using our custom function.
    return computeNumericExpression(completeExpressionString);
  }

  // Recursive Step: For each digit at `currentScanningIndex`, there are two choices:

  let cumulativeBranchSum = 0; // Initialize a local accumulator for the sums from this node's branches.

  // Choice 1: Insert a '+' after the current digit.
  // This separates the current digit into its own term (or appends to previous term)
  // and prepares for a new term starting with the next digit.
  const expressionWithAddition = currentExpressionFragment + digitSequenceForProcessing[currentScanningIndex] + '+';
  cumulativeBranchSum += exploreAndSumAllCombinations(currentScanningIndex + 1, expressionWithAddition);

  // Choice 2: Do NOT insert a '+' after the current digit.
  // This concatenates the current digit with the subsequent digits, forming a multi-digit number.
  const expressionWithoutAddition = currentExpressionFragment + digitSequenceForProcessing[currentScanningIndex];
  cumulativeBranchSum += exploreAndSumAllCombinations(currentScanningIndex + 1, expressionWithoutAddition);

  // Return the total sum accumulated from both possible paths (with '+' and without '+').
  return cumulativeBranchSum;
}

// Start the recursive exploration process from the beginning of the digit sequence (index 0)
// with an initially empty expression fragment.
const ultimateComputedTotal = exploreAndSumAllCombinations(0, '');

// Output the final computed sum, which represents the sum of all possible expressions.
console.log(ultimateComputedTotal);