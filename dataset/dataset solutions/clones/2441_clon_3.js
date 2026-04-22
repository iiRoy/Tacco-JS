// This script provides a utility for processing a single numerical input
// received via standard input, applying a specific mathematical transformation.
// It explicitly handles input parsing, validation, and error reporting.

/**
 * Computes an adjusted half value for a given integer.
 * The calculation logic depends on the parity of the input number:
 * - For an even number `N`, the result is `(N / 2) - 1`.
 * - For an odd number `N`, the result is `(N - 1) / 2`.
 *
 * This function ensures the input is a valid integer before proceeding.
 *
 * @param {number} numericDatum The integer value subjected to the transformation.
 * @returns {number | NaN} The computed numerical result, or `NaN` if the input is not a valid integer.
 */
function deriveParityAdjustedValue(numericDatum) {
  // Defensive programming: Validate the type and integrity of the incoming data.
  // We expect a finite integer to perform reliable calculations.
  if (typeof numericDatum !== 'number' || !Number.isInteger(numericDatum) || !Number.isFinite(numericDatum)) {
    console.error(`[ERROR] Invalid input type: Expected an integer, received "${numericDatum}" (${typeof numericDatum}).`);
    // Returning NaN signals a computation failure due to bad input.
    return NaN;
  }

  // Determine the parity of the numerical datum using the modulo operator.
  const isValueEven = (numericDatum % 2 === 0);

  // Initialize variables for intermediate calculation steps.
  // This breaks down the computation for clarity and potential debugging.
  let baseHalfCalculation;
  let finalAdjustmentFactor;
  let resultantQuantity;

  // Calculate the base integer half of the number.
  // For even numbers, this is N/2. For odd numbers, it's (N-1)/2.
  baseHalfCalculation = Math.floor(numericDatum / 2);

  // Apply a conditional adjustment based on the parity.
  // This replaces the original distinct `if/else` expressions with a unified approach.
  if (isValueEven) {
    // If the number is even, the original logic was (N/2) - 1.
    // Since baseHalfCalculation is N/2, we just subtract 1.
    finalAdjustmentFactor = 1;
  } else {
    // If the number is odd, the original logic was (N/2) - 0.5,
    // which simplifies to (N-1)/2.
    // Since baseHalfCalculation is already (N-1)/2 for odd numbers, no further adjustment is needed here.
    finalAdjustmentFactor = 0;
  }

  // Combine the intermediate steps to get the ultimate result.
  resultantQuantity = baseHalfCalculation - finalAdjustmentFactor;

  // An added diagnostic message to trace the execution flow and values,
  // useful for development and understanding the transformation.
  console.debug(`[DEBUG] Input: ${numericDatum}, Even: ${isValueEven}, BaseHalf: ${baseHalfCalculation}, Adj: ${finalAdjustmentFactor}, Result: ${resultantQuantity}`);

  return resultantQuantity;
}

/**
 * Manages the entire process flow: reading from stdin, parsing, validating,
 * invoking the core calculation logic, and printing the final output.
 * This acts as the main entry point for script execution.
 */
async function coordinateProcessingPipeline() {
  let standardInputContent; // Stores the raw string read from standard input.
  let processedNumericalInput; // Stores the parsed integer.

  try {
    // Asynchronously read the entire content from the standard input stream.
    // Using `await` for cleaner asynchronous code.
    standardInputContent = await require('fs/promises').readFile('/dev/stdin', 'utf8');

    // Remove leading/trailing whitespace which might interfere with parsing.
    const sanitizedInput = standardInputContent.trim();

    // Implement a crucial guard clause: Check if any content was actually provided.
    if (!sanitizedInput.length) {
      console.error("[ERROR] No input detected on /dev/stdin. Please provide a numerical value.");
      process.exit(1); // Indicate an error and terminate.
    }

    // Attempt to convert the sanitized string input into an integer.
    // The radix (base 10) is specified for consistency.
    processedNumericalInput = parseInt(sanitizedInput, 10);

    // Another guard: Verify that the parsing operation was successful.
    if (isNaN(processedNumericalInput)) {
      console.error(`[ERROR] Failed to parse input "${sanitizedInput}" into a valid integer. Aborting.`);
      process.exit(1); // Terminate with an error code.
    }

    // Invoke the primary calculation function with the validated numeric input.
    const finalCalculatedOutput = deriveParityAdjustedValue(processedNumericalInput);

    // If the calculation itself resulted in NaN (due to internal validation failure),
    // we should not print it as a valid result.
    if (isNaN(finalCalculatedOutput)) {
      console.error("[ERROR] Calculation failed for the provided input. Check previous error messages.");
      process.exit(1);
    }

    // Output the final computed value to the standard output stream.
    // A newline character is implicitly added by console.log.
    console.log(finalCalculatedOutput);

  } catch (operationError) {
    // Catch any unexpected errors during file I/O or other synchronous operations.
    console.error(`[CRITICAL ERROR] An unforeseen issue occurred during execution: ${operationError.message}`);
    // For more detailed debugging, uncomment the following line:
    // console.error(operationError.stack);
    process.exit(1); // Exit with a non-zero status to indicate failure.
  }
}

// This conditional block ensures that 'coordinateProcessingPipeline' is only
// called when the script is executed directly (not when imported as a module).
// This is a standard Node.js practice for script entry points.
if (require.main === module) {
  // Execute the main processing pipeline.
  // Using .then/.catch for the async function's promise, although direct `await`
  // at the top level is available in newer Node.js versions.
  coordinateProcessingPipeline().catch(err => {
    // This catch block handles any unhandled promise rejections from the async function.
    console.error(`[UNHANDLED REJECTION] An error occurred outside the main try-catch: ${err.message}`);
    process.exit(1);
  });
}