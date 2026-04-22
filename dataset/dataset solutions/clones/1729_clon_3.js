const fileSystemUtility = require("fs"); // Import the Node.js file system module for I/O operations.

/**
 * Executes a specialized numerical computation based on an integer input read from standard input.
 * This function calculates a sum where each term involves a divisor and a triangular number.
 *
 * The core logic calculates: Σ (i * (floor(N/i) * (floor(N/i) + 1) / 2)) for i from 1 to N.
 */
function performComplexSummation() {
  let rawInputContent; // Variable to temporarily hold the input data from the file.

  try {
    // Attempt to synchronously read the content of /dev/stdin.
    // Specifying 'utf8' encoding ensures the data is read as a string.
    rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", { encoding: "utf8" });
  } catch (fileReadError) {
    // In case of an error during file reading (e.g., file not found, permission issues).
    console.error(`An error occurred while attempting to read from /dev/stdin: ${fileReadError.message}`);
    // Terminate execution or handle the error appropriately if input is critical.
    return;
  }

  // Sanitize the input string: remove leading/trailing whitespace.
  const processedInputString = rawInputContent.trim();
  // Parse the cleaned string into an integer, using base 10.
  const upperLimitValue = parseInt(processedInputString, 10);

  // Validate the parsed numerical input.
  // It must be a valid number and a positive integer for the summation to proceed.
  if (isNaN(upperLimitValue) || upperLimitValue < 1) {
    console.warn(`Invalid or non-positive numerical input detected: '${processedInputString}'. Aborting calculation.`);
    return; // Exit the function if validation fails.
  }

  // Initialize the accumulator for the final sum.
  let totalComputedSum = 0;

  /**
   * Helper function to calculate the N-th triangular number (sum of integers from 1 to k).
   * T_k = k * (k + 1) / 2
   * @param {number} k The upper bound for the triangular number calculation.
   * @returns {number} The k-th triangular number.
   */
  const calculateTriangularNumber = (k) => {
    // This calculation always yields an integer because either k or (k+1) is even.
    return (k * (k + 1)) / 2;
  };

  // Iterate from 1 up to the `upperLimitValue` (inclusive).
  // The loop variable `currentIterationFactor` represents 'i' from the original problem.
  for (let currentIterationFactor = 1; currentIterationFactor <= upperLimitValue; ++currentIterationFactor) {
    // Calculate the floor of the division: upperLimitValue / currentIterationFactor.
    // Math.trunc is used for explicit integer division, equivalent to Math.floor for positive numbers.
    const currentQuotientFloor = Math.trunc(upperLimitValue / currentIterationFactor);

    // Compute the triangular number for the current quotient floor.
    const triangularSumComponent = calculateTriangularNumber(currentQuotientFloor);

    // Add the product of the current factor and the triangular component to the total sum.
    // Note: The original `Math.floor` around `i * n * (n + 1)` was redundant as the result
    // of `i * n * (n + 1) / 2` is always an integer. This simplification is a Type III change.
    totalComputedSum += currentIterationFactor * triangularSumComponent;
  }

  // Output the final computed result using a template literal for enhanced readability.
  console.log(`The final computed result for an upper limit of ${upperLimitValue} is: ${totalComputedSum}`);
}

// Invoke the main function to start the computation.
performComplexSummation();