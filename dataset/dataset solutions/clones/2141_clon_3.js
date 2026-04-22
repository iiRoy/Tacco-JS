/**
 * This file contains utilities for processing numerical sequences and combinations,
 * culminating in a calculation based on user input.
 * It demonstrates robust input handling and modular arithmetic.
 */

/**
 * Extracts individual string tokens from raw multiline input.
 * Each line is split by spaces, and all resulting tokens are collected into a single array.
 * Empty lines or tokens are ignored to ensure clean data.
 * @param {string} rawSourceData The raw string data, potentially multiline, to be parsed.
 * @returns {string[]} An array of all extracted non-empty string tokens.
 */
function extractTokens(rawSourceData) {
  // Validate input type and content. Return an empty array if invalid or empty.
  if (typeof rawSourceData !== 'string' || rawSourceData.trim() === '') {
    console.warn("Attempted to extract tokens from invalid or empty source data. Returning an empty array.");
    return [];
  }

  // Split the raw data into individual lines.
  const linesOfContent = rawSourceData.split('\n');
  const collectedElements = []; // This array will store all tokens.

  // Iterate over each line to process its content.
  for (const currentLine of linesOfContent) {
    const trimmedLine = currentLine.trim(); // Remove leading/trailing whitespace.
    if (trimmedLine === '') {
      continue; // Skip entirely empty lines.
    }
    // Split the trimmed line by spaces to get individual tokens.
    const lineTokens = trimmedLine.split(' ');
    // Add each non-empty token to the main collection.
    for (const singleToken of lineTokens) {
      if (singleToken !== '') { // Prevent adding empty strings that might result from multiple spaces.
        collectedElements.push(singleToken);
      }
    }
  }

  return collectedElements;
}

/**
 * Fetches the primary data set for the application.
 * It prioritizes reading from standard input (e.g., '/dev/stdin' on Unix-like systems)
 * but falls back to a hardcoded placeholder string if standard input is unavailable
 * or specifically overridden (e.g., for development/testing).
 * @returns {string} The raw input string data, either from stdin or the placeholder.
 */
function retrieveDataSet() {
  // A placeholder for development or testing purposes.
  // This string would typically be populated for local testing without stdin.
  const developmentDataPlaceholder = ``; // Keep empty to force stdin read by default.
  const standardInputPath = '/dev/stdin'; // Standard path for input stream.

  let receivedData = developmentDataPlaceholder;

  // Attempt to read from standard input if in a Node.js environment.
  try {
    // Check if the 'fs' module exists and can be resolved, indicating a Node.js environment.
    if (typeof require === 'function' && require.resolve && require.resolve('fs')) {
      const fileSystemModule = require('fs');
      // Read from stdin only if the placeholder is empty or if an environment variable explicitly requests it.
      if (receivedData === '' || process.env.USE_STDIN_OVERRIDE === 'true') {
        receivedData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
      }
    }
  } catch (error) {
    // If reading from stdin fails (e.g., file not found, not a Node.js env),
    // log the error and proceed with the placeholder data.
    console.error(`Failed to read from standard input (${standardInputPath}): ${error.message}. Using placeholder data.`);
  }

  return receivedData;
}

/**
 * Computes the product of all positive integers up to a given upper bound (i.e., factorial calculation).
 * This function handles non-negative integer inputs.
 * @param {number} upperBound The non-negative integer up to which the product is calculated.
 * @returns {number} The factorial of the upperBound. Returns 0 for negative inputs.
 */
function computeProductSequence(upperBound) { // Function renamed from 'factorial'
  // Input validation for non-negative integers.
  if (upperBound < 0) {
    console.warn(`Factorial is not defined for negative numbers. Input: ${upperBound}. Returning 0.`);
    return 0; // Factorial is generally not defined for negative numbers.
  }
  // Base case: factorial of 0 is 1.
  if (upperBound === 0) {
    return 1;
  }

  let accumulatedProduct = 1; // Renamed from 'number', initializes the product.
  const START_FACTOR = 1; // Defines the starting point for multiplication.

  // Using a while loop for an alternative iteration structure.
  let currentFactor = START_FACTOR; // Renamed from 'i'.
  while (currentFactor <= upperBound) {
    accumulatedProduct *= currentFactor; // Multiply by the current factor.
    currentFactor++; // Move to the next factor.
  }

  return accumulatedProduct;
}

/**
 * Calculates the binomial coefficient (n choose r), which represents the number of ways
 * to choose 'r' items from a set of 'n' distinct items without regard to their order.
 * This is calculated using the formula: n! / (r! * (n-r)!).
 * @param {number} totalItems The total number of available items (n).
 * @param {number} chosenItems The number of items to choose (r).
 * @returns {number} The binomial coefficient. Returns 0 for invalid choices.
 */
function calculateBinomialCoefficient(totalItems, chosenItems) { // Function renamed from 'combination'
  // Guard clauses for invalid or trivial inputs.
  if (chosenItems < 0 || chosenItems > totalItems) {
    console.warn(`Invalid input for binomial coefficient: n=${totalItems}, r=${chosenItems}. Returning 0.`);
    return 0; // Cannot choose a negative number of items or more items than available.
  }
  // Edge cases: nC0 = 1 and nCn = 1.
  if (chosenItems === 0 || chosenItems === totalItems) {
    return 1;
  }
  // Optimization: nCr = nC(n-r). Choosing the smaller 'r' reduces computation.
  if (chosenItems > totalItems / 2) {
    chosenItems = totalItems - chosenItems;
  }

  // Calculate the necessary factorials using the helper function.
  const factorialN = computeProductSequence(totalItems);
  const factorialR = computeProductSequence(chosenItems);
  const factorialNMinusR = computeProductSequence(totalItems - chosenItems);

  // Compute the denominator of the binomial coefficient formula.
  const denominator = factorialR * factorialNMinusR;

  // Calculate the final binomial coefficient.
  const resultCoefficient = factorialN / denominator;

  return resultCoefficient;
}

// Immediately Invoked Function Expression (IIFE) to encapsulate the main program logic.
// This pattern helps to avoid polluting the global scope.
(function executeProgram() { // Renamed from 'main'

  // Define a large prime number for modulo operations, common in competitive programming.
  const MODULO_BIG_PRIME = 1_000_000_007; // Renamed from 'c', using numeric separators for readability.

  // Step 1: Retrieve and process the raw input data.
  const rawInputStrings = retrieveDataSet();
  const dataElements = extractTokens(rawInputStrings); // Renamed from 'input'

  // Step 2: Validate the number of expected input elements.
  const REQUIRED_ELEMENT_COUNT = 3;
  if (dataElements.length < REQUIRED_ELEMENT_COUNT) {
    console.error(`Error: Insufficient input elements. Expected ${REQUIRED_ELEMENT_COUNT}, but received ${dataElements.length}.`);
    // Terminate execution if critical input is missing.
    return;
  }

  // Step 3: Parse the essential numerical parameters from the input array.
  // Using Number() for explicit and robust type conversion.
  const totalElementsCount = Number(dataElements[0]); // Renamed from 'n'
  const forbiddenIndexA = Number(dataElements[1]); // Renamed from 'a'
  const forbiddenIndexB = Number(dataElements[2]); // Renamed from 'b'

  // Step 4: Perform sanity checks on the parsed numerical inputs.
  if (isNaN(totalElementsCount) || isNaN(forbiddenIndexA) || isNaN(forbiddenIndexB) ||
      totalElementsCount < 0 || forbiddenIndexA < 1 || forbiddenIndexB < 1 ||
      forbiddenIndexA > totalElementsCount || forbiddenIndexB > totalElementsCount) {
    console.error("Error: Invalid numerical input parameters detected. Please ensure n, a, b are positive integers and a, b are within [1, n].");
    return; // Terminate execution if any critical parameter is invalid.
  }

  let cumulativeResult = 0; // Renamed from 'sum', accumulates the binomial coefficients.
  const iterationStart = 1; // Explicitly defines the starting point of the loop.
  const iterationEnd = totalElementsCount; // Explicitly defines the ending point of the loop.

  // Create a Set for efficient lookup of excluded indices.
  const excludedIndices = new Set([forbiddenIndexA, forbiddenIndexB]);

  // Step 5: Iterate through possible choices (r from 1 to n) and accumulate results.
  for (let currentIterationIndex = iterationStart; currentIterationIndex <= iterationEnd; currentIterationIndex++) { // Renamed from 'r', changed 'var' to 'let'.
    // Check if the current index is one of the forbidden ones.
    if (excludedIndices.has(currentIterationIndex)) { // Using Set.has for O(1) lookup, a Type III rewrite.
      continue; // Skip this iteration if the index is excluded.
    }

    // Add the calculated binomial coefficient to the cumulative result.
    cumulativeResult += calculateBinomialCoefficient(totalElementsCount, currentIterationIndex);
  }

  // Step 6: Apply modulo operation to the final cumulative result.
  // The pattern (x % m + m) % m ensures a positive result for modulo,
  // even if 'cumulativeResult' were theoretically negative (though not in this specific problem).
  const finalModuloResult = (cumulativeResult % MODULO_BIG_PRIME + MODULO_BIG_PRIME) % MODULO_BIG_PRIME;

  // Step 7: Output the final computed value to the console.
  console.log(finalModuloResult);

})();