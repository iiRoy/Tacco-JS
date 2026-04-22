// A utility function to create a unique identifier for caching purposes.
// This helps in memoizing results based on coordinates, converting BigInts to strings for keys.
const composeIdentifier = (firstCoord, secondCoord) => {
  return "row" + firstCoord.toString() + "_col" + secondCoord.toString();
};

// Global cache for storing previously computed values.
// This prevents redundant calculations in the recursive process, acting as a memoization table.
const resultCache = new Map();

// A fixed modulo value used for the final output, declared as a BigInt.
const MODULO_CONSTANT = 998244353n;

/**
 * Recursively computes a value based on four BigInt parameters, often representing coordinates in a grid.
 * It employs memoization (dynamic programming) to significantly optimize performance
 * by storing and reusing results of overlapping subproblems.
 *
 * @param {bigint} initialRow - The unchanging starting row coordinate for the problem.
 * @param {bigint} initialCol - The unchanging starting column coordinate for the problem.
 * @param {bigint} currentTargetRow - The current target row coordinate for this specific computation.
 * @param {bigint} currentTargetCol - The current target column coordinate for this specific computation.
 * @returns {bigint} The calculated BigInt value for the given coordinates. Returns 0n for invalid inputs.
 */
const evaluateExpression = (initialRow, initialCol, currentTargetRow, currentTargetCol) => {
  // Guard clause: If target coordinates become negative, it's an invalid state
  // for this problem's domain (e.g., indices of a matrix).
  // Returning 0n is a common way to handle out-of-bounds in such recursive patterns.
  if (currentTargetRow < 0n || currentTargetCol < 0n) {
    return 0n;
  }

  // Generate a unique string key for the current (currentTargetRow, currentTargetCol) pair.
  // This key is used to look up results in the memoization cache.
  const cacheLookupKey = composeIdentifier(currentTargetRow, currentTargetCol);

  // Check if the result for these coordinates has already been computed and stored.
  // If present, return the cached value directly, avoiding redundant calculations.
  if (resultCache.has(cacheLookupKey)) {
    return resultCache.get(cacheLookupKey);
  }

  let calculatedResult; // This variable will hold the final outcome for the current call.

  // --- Base Cases for the Recursive Definition ---

  // Condition 1: If the initial row matches the current target row.
  if (initialRow === currentTargetRow) {
    const colDifference = currentTargetCol - initialCol; // Calculate the exponent.
    // Ensure the exponent is non-negative. BigInt exponentiation `**` does not support
    // negative exponents. This check prevents runtime errors for invalid states.
    if (colDifference < 0n) {
        calculatedResult = 0n; // Or throw an error, depending on problem specification.
    } else {
        calculatedResult = initialRow ** colDifference; // Perform BigInt exponentiation.
    }
  }
  // Condition 2: If the initial column matches the current target column.
  else if (initialCol === currentTargetCol) {
    const rowDifference = currentTargetRow - initialRow; // Calculate the exponent.
    // Similar check for non-negative exponent for BigInt exponentiation.
    if (rowDifference < 0n) {
        calculatedResult = 0n;
    } else {
        calculatedResult = initialCol ** rowDifference; // Perform BigInt exponentiation.
    }
  }
  // --- Recursive Step ---
  // If neither base case is met, apply the recursive formula.
  else {
    // Pre-calculate decremented values to improve readability and potentially avoid
    // repeated calculations in the recursive calls.
    const oneStepBackRow = currentTargetRow - 1n;
    const oneStepBackCol = currentTargetCol - 1n;

    // Term A: Recursively evaluate for (c-1, d) and multiply by d.
    const termA = evaluateExpression(initialRow, initialCol, oneStepBackRow, currentTargetCol) * currentTargetCol;

    // Term B: Recursively evaluate for (c, d-1) and multiply by c.
    // Note: The original formula multiplies by 'c' (currentTargetRow), not 'd'.
    const termB = evaluateExpression(initialRow, initialCol, currentTargetRow, oneStepBackCol) * currentTargetRow;

    // Term C: Recursively evaluate for (c-1, d-1) and multiply by (c-1) and (d-1).
    const termC_multiplier = oneStepBackRow * oneStepBackCol;
    const termC = evaluateExpression(initialRow, initialCol, oneStepBackRow, oneStepBackCol) * termC_multiplier;

    // Combine the three terms according to the problem's recursive relation.
    calculatedResult = termA + termB - termC;
  }

  // Before returning, store the newly computed result in the cache.
  // This ensures that future calls with the same (currentTargetRow, currentTargetCol)
  // will retrieve this value instantly.
  resultCache.set(cacheLookupKey, calculatedResult);
  return calculatedResult;
};

/**
 * Main entry point for processing input data and executing the primary calculation.
 * Reads input from a specified source (typically stdin), parses the BigInt parameters,
 * invokes the recursive calculation, and prints the final result modulo a constant.
 *
 * @param {string} rawInputData - The raw string input, expected to contain parameters on the first line.
 */
const executeProgram = (rawInputData) => {
  // Input validation: Check if raw input data is provided and not just empty whitespace.
  if (!rawInputData || rawInputData.trim() === "") {
    console.error("Error: No input data was provided or it was empty.");
    return; // Exit if input is invalid.
  }

  const inputLines = rawInputData.split("\n");

  // Further validation: Ensure the first line containing parameters exists and is not empty.
  if (inputLines.length === 0 || inputLines[0].trim() === "") {
    console.error("Error: The essential parameter line is missing from the input.");
    return; // Exit if parameter line is missing.
  }

  // Parse the four BigInt parameters from the first line of input.
  // Uses a regex to split by one or more whitespace characters for robustness,
  // then filters out any empty strings that might result from multiple spaces,
  // and finally maps each string segment to a BigInt.
  const [initialA, initialB, finalC, finalD] = inputLines[0]
    .split(/\s+/) // Split by any sequence of whitespace characters.
    .filter(segment => segment !== "") // Remove empty strings from potential multiple spaces.
    .map((numericString) => BigInt(numericString)); // Convert each valid segment to BigInt.

  // Execute the primary recursive calculation with the parsed parameters.
  const finalComputedValue = evaluateExpression(initialA, initialB, finalC, finalD);

  // Apply the modulo operation to the final computed value.
  // The `(X % M + M) % M` pattern ensures the result is always non-negative,
  // which is important if `finalComputedValue` could potentially be negative
  // (though unlikely in this specific problem context with BigInts).
  const finalModuloResult = (finalComputedValue % MODULO_CONSTANT + MODULO_CONSTANT) % MODULO_CONSTANT;

  // Print the final result to the console, converting the BigInt to a standard Number.
  // Note: This conversion might lose precision for extremely large BigInts if they
  // exceed Number.MAX_SAFE_INTEGER, but for typical competitive programming modulo results,
  // it's usually safe.
  console.log(Number(finalModuloResult));
};

// Entry point for execution: Reads input from standard input (/dev/stdin)
// and passes it to the main processing function. Includes basic error handling
// for file system operations.
try {
    const fileSystemModule = require("fs"); // Dynamically load the file system module.
    const standardInputFilePath = "/dev/stdin"; // Standard path for input in many environments.
    const inputEncoding = "utf8"; // Specify character encoding for reading the file.

    // Read the entire content of the standard input file synchronously.
    const fileContent = fileSystemModule.readFileSync(standardInputFilePath, inputEncoding);

    // Invoke the program's main logic with the read content.
    executeProgram(fileContent);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or program execution.
    console.error("An error occurred during program execution:", executionError.message);
    // Optionally, for debugging or local testing, you could provide a default input here
    // if reading from stdin fails, e.g.:
    // executeProgram("1 1 2 2");
}