const _SEARCH_RANGE_LIMIT_ = 100n; // Defines the upper bound for the iterative search range (exclusive).

/**
 * Computes the fifth power of a given BigInt number.
 * This auxiliary function enhances readability and encapsulates the power calculation logic.
 * @param {bigint} baseValue - The BigInt number to be raised to the fifth power.
 * @returns {bigint} The result of baseValue^5.
 */
const calculateFifthPower = (baseValue) => {
  // Direct multiplication is employed for BigInts as standard Math.pow
  // does not directly support BigInt arguments.
  return baseValue * baseValue * baseValue * baseValue * baseValue;
};

/**
 * The primary function responsible for solving the puzzle. It seeks two BigInts,
 * 'candidateA' and 'candidateB', within the range [0, _SEARCH_RANGE_LIMIT_ - 1],
 * such that either (candidateA^5 - candidateB^5) or (candidateA^5 + candidateB^5)
 * equals the provided 'targetSum'.
 *
 * @param {string} dataPayload - The raw string input, expected to contain the target BigInt sum.
 * @returns {void} Outputs the found pair of BigInts (candidateA, candidateB) to the console.
 */
const executeSolver = (dataPayload) => {
  // Comprehensive validation of the incoming data payload.
  if (typeof dataPayload !== 'string' || dataPayload.trim().length === 0) {
    console.error("Execution Error: The input data payload is either empty, null, or not a string type.");
    return; // Terminate execution gracefully on invalid input.
  }

  let targetSum; // Variable to hold the parsed target sum.
  try {
    // Attempt to parse the trimmed input string into a BigInt.
    targetSum = BigInt(dataPayload.trim());
  } catch (parsingException) {
    console.error(`Parsing Error: Unable to convert input string into a BigInt: ${parsingException.message}`);
    return; // Terminate if BigInt parsing fails.
  }

  let isSolutionDiscovered = false; // A boolean flag to indicate if a valid solution pair has been found.
  let finalCandidateA = 0n;        // Stores the 'x' component of the identified solution.
  let finalCandidateB = 0n;        // Stores the 'y' component of the identified solution.

  // Outer iteration loop for the first component, 'candidateA'.
  // Iterates from 0 up to, but not including, _SEARCH_RANGE_LIMIT_.
  for (let candidateA = 0n; candidateA < _SEARCH_RANGE_LIMIT_; candidateA++) {
    // Inner iteration loop for the second component, 'candidateB'.
    // Iterates from 0 up to, but not including, _SEARCH_RANGE_LIMIT_.
    for (let candidateB = 0n; candidateB < _SEARCH_RANGE_LIMIT_; candidateB++) {

      // Compute the fifth powers for the current 'candidateA' and 'candidateB'
      // using the dedicated helper function to maintain modularity.
      const powerOfA = calculateFifthPower(candidateA);
      const powerOfB = calculateFifthPower(candidateB);

      // First conditional check: Does the difference of their fifth powers match the target sum?
      if (powerOfA - powerOfB === targetSum) {
        isSolutionDiscovered = true;
        finalCandidateA = candidateA;
        finalCandidateB = candidateB; // In this scenario, candidateB is considered positive.
        break; // Exit the inner loop immediately as a solution has been found.
      }
      // Second conditional check: Does the sum of their fifth powers match the target sum?
      else if (powerOfA + powerOfB === targetSum) {
        isSolutionDiscovered = true;
        finalCandidateA = candidateA;
        finalCandidateB = -candidateB; // In this scenario, candidateB is considered negative.
        break; // Exit the inner loop immediately as a solution has been found.
      }
    }

    // If a solution was found within the inner loop, break out of the outer loop too.
    if (isSolutionDiscovered) {
      break;
    }
  }

  // After the loops conclude, if a solution was successfully identified, print it.
  if (isSolutionDiscovered) {
    // Utilizes template literals for a clean and readable output format.
    console.log(`${finalCandidateA} ${finalCandidateB}`);
  } else {
    // This block would execute if no solution is found within the specified search parameters.
    // For the context of this problem, a solution is generally expected to exist.
    // console.warn("Notice: No solution pair was identified within the given search boundaries.");
  }
};

// --- Application Runtime Environment Configuration and Execution Dispatch ---
// This section determines the execution context (e.g., test, development, production)
// based on an environment variable and dispatches the appropriate input handling.
const _APP_RUNTIME_MODE_ = process.env.EXECUTION_CONTEXT || 'default_production'; // Custom environment variable name.

/**
 * Helper function to read file content robustly.
 * @param {string} filePath - The absolute or relative path to the file.
 * @returns {string} The entire content of the file as a UTF-8 string.
 * @throws {Error} Throws an error if the file cannot be accessed or read.
 */
const acquireFileContents = (filePath) => {
  // Dynamically require the 'fs' module for file system operations.
  const fileSystemHandler = require('fs');
  return fileSystemHandler.readFileSync(filePath, 'utf8');
};

// A switch statement provides a clear and extensible way to handle different execution modes.
switch (_APP_RUNTIME_MODE_) {
  case 'testing_framework':
    console.info("Application running in 'testing_framework' mode. Simulating a test case.");
    // In a real testing framework, a specific test suite or mock function would be called.
    // Here, we provide a hardcoded example input for demonstration.
    executeSolver("1"); // Example: 1^5 - 0^5 = 1
    break;

  case 'local_development':
    console.info("Application running in 'local_development' mode. Attempting to read input from 'dev/local_input.txt'.");
    try {
      // For local development, input might be sourced from a specific file path.
      const devInputData = acquireFileContents('dev/local_input.txt');
      executeSolver(devInputData);
    } catch (err) {
      console.error(`Development Mode Error: Failed to read input file: ${err.message}`);
    }
    break;

  case 'default_production':
  default: // Handles any unspecified or default environment contexts.
    console.info("Application running in 'default_production' mode. Reading from standard input (/dev/stdin).");
    try {
      // The standard production path: read input from the typical standard input stream.
      const productionInputData = acquireFileContents('/dev/stdin');
      executeSolver(productionInputData);
    } catch (err) {
      console.error(`Production Mode Error: Failed to read from /dev/stdin: ${err.message}`);
    }
    break;
}