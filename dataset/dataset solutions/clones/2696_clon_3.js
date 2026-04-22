// This utility module is designed for computing a specific type of average or midpoint
// between two numerical inputs, with special handling for sums that are odd.

/**
 * Processes a pair of numeric operands to determine a balanced integer midpoint.
 * If the combined total of the operands is an odd number, it indicates that
 * a perfect integer midpoint cannot be achieved.
 *
 * @param {number} primaryOperand - The initial numerical value provided.
 * @param {number} secondaryOperand - The subsequent numerical value for processing.
 * @returns {number | string} The calculated integer midpoint if the sum is even,
 *                           or a descriptive string if the sum is odd or inputs are invalid.
 */
const processNumericPair = (primaryOperand, secondaryOperand) => {
  // Implement a defensive check for valid number types and NaN values
  // This adds robustness beyond what JSDoc or TypeScript checks might offer at runtime.
  if (typeof primaryOperand !== 'number' || typeof secondaryOperand !== 'number' || isNaN(primaryOperand) || isNaN(secondaryOperand)) {
    return "INVALID_INPUT_TYPE_OR_NAN_DETECTED";
  }

  // Calculate the total aggregation of the two input operands.
  const aggregateSum = primaryOperand + secondaryOperand;

  // Check if the aggregate sum is an odd number.
  // Using the bitwise AND operator (aggregateSum & 1) is an efficient way
  // to determine if a number is odd (result is 1) or even (result is 0).
  if ((aggregateSum & 1) !== 0) {
    // If the sum is odd, a perfectly balanced integer midpoint is not feasible.
    return 'UNBALANCED_TOTAL_VALUE'; // Replaced 'IMPOSSIBLE' with a more specific message.
  }

  // If the sum is even, proceed to calculate the midpoint.
  // The bitwise right shift operator (aggregateSum >> 1) is an optimized way
  // to perform integer division by 2. For even numbers, this is equivalent to aggregateSum / 2.
  const derivedMidpoint = aggregateSum >> 1;

  // Return the resulting midpoint.
  return derivedMidpoint;
};

/**
 * A helper function to parse command-line arguments into numeric values,
 * including validation for both quantity and type.
 *
 * @param {string[]} rawArgumentVector - The array of raw command-line arguments (e.g., process.argv).
 * @returns {{ success: boolean, valueA?: number, valueB?: number, diagnosticMessage?: string }}
 *          An object indicating the outcome of the parsing, containing parsed numbers on success,
 *          or an error message on failure.
 */
const parseCommandLineInputs = (rawArgumentVector) => {
  // Ensure that at least two user-provided arguments are present.
  // process.argv typically includes 'node' at index 0 and the script path at index 1.
  if (rawArgumentVector.length < 4) {
    return { success: false, diagnosticMessage: "Insufficient command-line arguments. Expected two numbers." };
  }

  // Extract the specific arguments that are expected to be numbers.
  const argumentStringOne = rawArgumentVector[2];
  const argumentStringTwo = rawArgumentVector[3];

  // Attempt to convert the string arguments into floating-point numbers.
  const convertedValueOne = parseFloat(argumentStringOne);
  const convertedValueTwo = parseFloat(argumentStringTwo);

  // Validate if the conversion resulted in actual numbers.
  if (isNaN(convertedValueOne) || isNaN(convertedValueTwo)) {
    return { success: false, diagnosticMessage: `Input error: '${argumentStringOne}' or '${argumentStringTwo}' could not be parsed as valid numbers.` };
  }

  // If parsing and validation are successful, return the numeric values.
  return { success: true, valueA: convertedValueOne, valueB: convertedValueTwo };
};

// This immediately invoked function expression (IIFE) serves as the main entry point
// for executing the script's logic when run from the command line.
(() => {
  // First, parse and validate the command-line arguments using the dedicated helper.
  const parsedArgsOutcome = parseCommandLineInputs(process.argv);

  // Check if the argument parsing was successful.
  if (!parsedArgsOutcome.success) {
    console.error(`Runtime Error: ${parsedArgsOutcome.diagnosticMessage}`);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
  }

  // Safely extract the validated numeric inputs.
  // TypeScript non-null assertions (!) are used here as `success: true` guarantees their presence.
  const firstDataPoint = parsedArgsOutcome.valueA;
  const secondDataPoint = parsedArgsOutcome.valueB;

  // Invoke the core processing function with the validated data points.
  const finalCalculationResult = processNumericPair(firstDataPoint, secondDataPoint);

  // Output the final computed result or error message to the console.
  console.log(`Program Output: ${finalCalculationResult}`);
})();