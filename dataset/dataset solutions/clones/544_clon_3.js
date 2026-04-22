/**
 * This JavaScript module is designed to process numerical arguments provided via the command line.
 * It executes a specific arithmetic calculation, involving integer division and an increment operation,
 * and then outputs the final computed value. The module incorporates robust input validation
 * and error handling mechanisms to ensure reliable operation.
 */

/**
 * Core utility functions for handling command-line input and output operations.
 * This object centralizes argument parsing, validation, and result/error display.
 * @namespace inputOutputManager
 */
const inputOutputManager = {
  /**
   * Extracts, parses, and rigorously validates the numerical inputs from the command-line arguments.
   * This method ensures that exactly two finite numbers are provided and that the divisor is not zero.
   *
   * @param {string[]} commandLineParams - The raw array of arguments, typically `process.argv`.
   * @returns {number[]} An array containing the two validated numeric operands.
   * @throws {Error} If the argument count is incorrect, if any argument is not a valid finite number,
   *                 or if a division by zero scenario is detected.
   */
  retrieveAndValidateOperands: (commandLineParams) => {
    // Determine the expected and actual number of user-supplied arguments.
    // `process.argv` includes 'node' and the script path, so 2 user args means a total length of 4.
    const requiredUserArgumentCount = 2;
    const currentArgumentCount = commandLineParams.length - 2;

    // Check if the correct number of arguments has been provided.
    if (currentArgumentCount !== requiredUserArgumentCount) {
      throw new Error(`Incorrect usage: This program requires ${requiredUserArgumentCount} numeric inputs.
        Received ${currentArgumentCount} arguments.
        Example: node script.js <integer_dividend> <integer_divisor>`);
    }

    // Extract the raw string representations of the arguments.
    const rawInputOne = commandLineParams[2];
    const rawInputTwo = commandLineParams[3];

    // Attempt to convert the string inputs to numeric values.
    // The unary plus operator (`+`) is used here for concise type coercion.
    const operandOne = +rawInputOne;
    const operandTwo = +rawInputTwo;

    // Perform comprehensive validation for each operand.
    // Ensure they are not NaN (Not a Number) and are finite (not Infinity or -Infinity).
    if (Number.isNaN(operandOne) || !Number.isFinite(operandOne)) {
      throw new Error(`Data format error: The first argument '${rawInputOne}' is not a valid finite numerical value.`);
    }
    if (Number.isNaN(operandTwo) || !Number.isFinite(operandTwo)) {
      throw new Error(`Data format error: The second argument '${rawInputTwo}' is not a valid finite numerical value.`);
    }

    // Crucial check to prevent division by zero, which results in `Infinity` or `NaN`.
    if (operandTwo === 0) {
      throw new Error("Arithmetic constraint violation: Division by zero is undefined. The divisor must be a non-zero value.");
    }

    // Return the successfully validated numeric operands.
    return [operandOne, operandTwo];
  },

  /**
   * Presents the final computed numerical outcome to the standard output stream.
   *
   * @param {number} finalResultValue - The numerical value to be displayed.
   */
  outputFinalOutcome: (finalResultValue) => {
    // Prepend a descriptive message for clarity.
    console.log(`The calculated numerical outcome is: ${finalResultValue}`);
  },

  /**
   * Reports an error message to the standard error stream.
   * This function is used for displaying operational failures or invalid input notifications.
   *
   * @param {string} errorMessageText - The detailed error message to output.
   */
  signalOperationFailure: (errorMessageText) => {
    // Emphasize the error nature by prefixing the message.
    console.error(`ERROR: ${errorMessageText}`);
  }
};

/**
 * Contains the core mathematical processing logic for this application.
 * @namespace mathProcessor
 */
const mathProcessor = {
  /**
   * Executes a specialized integer division operation, equivalent to Java's `Math.floorDiv`,
   * and then increments the resulting floored quotient by one.
   *
   * @param {number} primaryDividend - The number that is to be divided.
   * @param {number} secondaryDivisor - The number by which the dividend is to be divided.
   * @returns {number} The integer result of the floor division, incremented by one.
   */
  performFlooredQuotientIncrement: (primaryDividend, secondaryDivisor) => {
    // First, compute the floating-point division.
    const intermediateQuotient = primaryDividend / secondaryDivisor;

    // Apply the floor operation to get the integer part.
    // `Math.floor()` correctly handles both positive and negative results
    // to match Java's `Math.floorDiv` behavior.
    const integerQuotient = Math.floor(intermediateQuotient);

    // Finally, add one to the floored quotient as per the application's logic.
    const finalAdjustedValue = integerQuotient + 1;

    return finalAdjustedValue;
  }
};

/**
 * This function serves as an additional, non-essential fragment.
 * It might represent a future feature or metadata, but is not critical to the core logic.
 * @returns {string} A string representing a notional version identifier.
 */
function retrieveApplicationBuildIdentifier() {
  // This could be dynamically loaded from a configuration file in a larger system.
  return "AppVersion-2.1.beta";
}

// The main execution block of the script.
// It orchestrates the entire workflow: input validation, core computation, and result presentation.
try {
  // Step 1: Secure and validate the necessary numerical inputs from the command-line arguments.
  // Destructuring assignment is used here to extract the two operands.
  const [initialDividendTerm, initialDivisorTerm] = inputOutputManager.retrieveAndValidateOperands(process.argv);

  // Step 2: Perform the primary calculation using the validated input terms.
  const ultimateCalculatedFigure = mathProcessor.performFlooredQuotientIncrement(
    initialDividendTerm,
    initialDivisorTerm
  );

  // Step 3: Display the final computed result to the user through the console.
  inputOutputManager.outputFinalOutcome(ultimateCalculatedFigure);

  // Example of using the non-essential fragment (optional, could be removed too)
  // console.log(`Debug Info: ${retrieveApplicationBuildIdentifier()}`);

} catch (executionProblem) {
  // If any error occurs during input processing or computation,
  // catch it here and report it gracefully.
  inputOutputManager.signalOperationFailure(executionProblem.message);
  // Indicate an abnormal termination to the operating system.
  process.exit(1);
}