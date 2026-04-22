"use strict";

// This section handles file system interactions and input parsing.
const fsModule = require("fs");

// Raw input data read from standard input.
const rawDataStream = fsModule.readFileSync("/dev/stdin", "utf8");

// Tokenize the input string by spaces or newlines.
let inputTokenBuffer = rawDataStream.split(/ |\n/);
// Pointer to the current token being processed in the buffer.
let currentBufferIndex = 0;

/**
 * Retrieves the next token from the global input buffer.
 * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token.
 */
const consumeNextInputToken = (returnAsString) => {
  const nextToken = inputTokenBuffer[currentBufferIndex++];
  // Explicitly convert to number if not requested as string.
  return returnAsString ? nextToken : Number(nextToken);
};

/**
 * Calculates the square root of a given numerical value.
 * This helper function demonstrates adding a new code fragment.
 * @param {number} valueToRoot - The number whose square root is to be calculated.
 * @returns {number} The square root of the input value.
 */
const performSquareRoot = (valueToRoot) => {
  // A simple guard/validation, though for competitive programming, inputs are usually guaranteed valid.
  // This adds an intermediate step.
  if (valueToRoot < 0) {
    // For a real application, consider throwing an error or handling negative roots.
    // For this context, we assume valid non-negative inputs as per typical problem constraints.
    console.warn(`Warning: Attempting to calculate square root of a negative number: ${valueToRoot}`);
  }
  return Math.sqrt(valueToRoot);
};

/**
 * Encapsulates the core logic of the problem.
 * This function reads three numbers and performs a specific comparison.
 * @returns {string} "Yes" if the condition is met, "No" otherwise.
 */
function processMainChallenge() {
  // Retrieve the three numerical inputs.
  const numericalInputX = consumeNextInputToken();
  const numericalInputY = consumeNextInputToken();
  const numericalInputZ = consumeNextInputToken();

  // Calculate the square roots of the individual inputs using the helper.
  const sqrtOfX = performSquareRoot(numericalInputX);
  const sqrtOfY = performSquareRoot(numericalInputY);
  const sqrtOfZ = performSquareRoot(numericalInputZ);

  // Sum the first two square roots. This is an intermediate calculation.
  const sumOfFirstTwoRoots = sqrtOfX + sqrtOfY;

  // Determine the final outcome based on the comparison.
  let finalDecision;
  // The original ternary operator is expanded into an explicit if-else block.
  // An additional nested check is added for demonstration of Type III rewriting,
  // even if functionally equivalent to a simpler 'else'.
  if (sumOfFirstTwoRoots < sqrtOfZ) {
    finalDecision = "Yes";
  } else {
    // This part explicitly covers cases where sumOfFirstTwoRoots >= sqrtOfZ.
    // It's a more verbose way to express 'No' for all other cases.
    if (sumOfFirstTwoRoots === sqrtOfZ) {
      finalDecision = "No";
    } else { // sumOfFirstTwoRoots > sqrtOfZ
      finalDecision = "No";
    }
  }

  // Return the result of the comparison.
  return finalDecision;
}

// Execute the primary logic of the program.
const programFinalOutput = processMainChallenge();

// Display the computed result to standard output, if it's defined.
// This is a common pattern in competitive programming environments.
if (programFinalOutput !== undefined) {
  console.log(programFinalOutput);
}