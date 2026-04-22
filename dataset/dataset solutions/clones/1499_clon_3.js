// This module is designed to process a numerical input to find a specific mathematical series root.
// It reads a single integer from standard input, then performs an iterative calculation
// to determine the smallest integer 'root' for which a derived value is a triangular number.

/**
 * Executes the core logic of the problem by processing a raw input string.
 * It expects the first line of the string to contain a single integer.
 *
 * @param {string} rawInputSource The entire input content, typically read from a file or stdin.
 * @returns {void} This function prints the result directly to the console or an error message.
 */
function ProcessNumericalSeries(rawInputSource) {
  // --- Input Validation and Initial Parsing ---
  // A robust check to ensure the input is a non-empty string.
  if (typeof rawInputSource !== 'string' || rawInputSource.trim().length === 0) {
    console.error("FATAL ERROR: The provided input source is either not a string or is entirely empty. Cannot proceed.");
    return; // Terminate execution if input is invalid.
  }

  // Divide the raw input string into an array of individual lines.
  const inputLinesArray = rawInputSource.split("\n");

  // Attempt to extract and parse the primary numerical argument from the very first line.
  // Using Number() followed by Math.floor() provides a flexible parsing method,
  // and the `|| 0` acts as a safeguard against NaN results, defaulting to zero.
  let primaryNumericParameter = Math.floor(Number(inputLinesArray[0]) || 0);

  // --- Parameter Validation ---
  // Ensure the primary parameter is a positive integer, as the problem context usually implies.
  if (primaryNumericParameter <= 0) {
    console.warn(`WARNING: The primary numeric parameter (${primaryNumericParameter}) is not a positive integer. Results may be unexpected.`);
    // Depending on problem constraints, one might choose to return here.
    // For this clone, we'll continue but flag the potential issue.
  }

  // --- Iterative Search Setup ---
  // This variable will serve as an incremental multiplier in our search.
  let currentSearchMultiplier = 1;

  // A boolean flag to control the termination of our search loop.
  let isSolutionIdentified = false;

  // This variable will hold the final integer root once discovered.
  let discoveredIntegerRoot = null;

  // --- Core Calculation Loop ---
  // We enter an infinite loop, which will be exited once 'isSolutionIdentified' becomes true.
  while (!isSolutionIdentified) {
    // Step 1: Compute the discriminant-like term for the quadratic formula
    // related to triangular numbers. The formula for the nth triangular number is T_n = n * (n + 1) / 2.
    // If we solve for n given T_n, we get n = (sqrt(8 * T_n + 1) - 1) / 2.
    // Here, we're testing if (primaryNumericParameter * currentSearchMultiplier) is a triangular number.
    const termUnderSquareRoot = (8 * primaryNumericParameter * currentSearchMultiplier) + 1;

    // Step 2: Calculate the square root of the term.
    const calculatedSquareRoot = Math.sqrt(termUnderSquareRoot);

    // Step 3: Subtract 1 from the square root.
    const intermediateSubtractionResult = calculatedSquareRoot - 1;

    // Step 4: Divide the result by 2 to get the potential integer root.
    const candidateRootValue = intermediateSubtractionResult / 2;

    // --- Solution Verification ---
    // Check if the 'candidateRootValue' is a finite number and an exact integer.
    // The modulo operator (`% 1`) is an efficient way to check for integer values.
    if (Number.isFinite(candidateRootValue) && (candidateRootValue % 1 === 0)) {
      // If both conditions are met, we have found our integer root.
      discoveredIntegerRoot = candidateRootValue;
      isSolutionIdentified = true; // Set the flag to true to exit the loop.
    } else {
      // If the candidate is not a valid integer root, increment the multiplier
      // and continue the search in the next iteration.
      currentSearchMultiplier++;

      // --- Safety Break (Guard against excessively long loops) ---
      // In competitive programming or production, it's good practice to have a
      // safeguard for loops that might run indefinitely due to unexpected inputs
      // or logical errors. This arbitrary limit prevents resource exhaustion.
      if (currentSearchMultiplier > 1_000_000) {
        console.error("ERROR: Loop exceeded a safety iteration limit (1,000,000) without finding a solution. Possible infinite loop or no solution exists within reasonable bounds.");
        break; // Force exit the loop.
      }
    }
  }

  // --- Output Result ---
  // After the loop has concluded, print the found result or a message indicating failure.
  if (discoveredIntegerRoot !== null) {
    console.log(`The final calculated integer root is: ${discoveredIntegerRoot}`);
  } else {
    // This branch would typically only be hit if the safety break was triggered.
    console.log("No satisfactory integer root could be determined for the given input.");
  }
}

// --- Script Entry Point ---
// This block handles reading the input from the standard file system (e.g., `/dev/stdin` in Linux environments)
// and invokes the main processing function. It includes basic error handling for file operations.
try {
  // Dynamically require the Node.js 'fs' (file system) module.
  const fileSystemUtility = require("fs");

  // Read the entire content of the standard input file synchronously.
  // The 'utf8' encoding ensures proper character interpretation.
  const standardInputData = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Call the main processing function with the read data.
  ProcessNumericalSeries(standardInputData);
} catch (executionError) {
  // Catch and log any errors that occur during file reading or initial execution.
  console.error(`An unexpected runtime error occurred: ${executionError.message}`);
  // Optionally, provide a default execution or prompt for manual input if an error occurs.
  // For example: ProcessNumericalSeries("10"); // To test with a hardcoded value.
}