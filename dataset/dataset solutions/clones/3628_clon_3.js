// This JavaScript module is designed to perform a specialized numerical conversion:
// transforming a standard decimal integer into its equivalent representation in base -2,
// commonly referred to as negabinary. It includes features for debugging and robust input handling.
"use strict"; // Ensures the code runs in strict mode, catching common coding errors and "unsafe" actions.

// A boolean flag that controls verbose logging and switches the input source for development.
// When set to 'true', detailed operation steps are logged to the console, and a predefined
// debug value is used instead of reading from standard input.
const TRACE_EXECUTION_ENABLED = false;

// Retrieves the raw string input for processing. Depending on the `TRACE_EXECUTION_ENABLED` flag,
// it either uses a hardcoded debug value or reads from the standard input stream.
const providedInputString = TRACE_EXECUTION_ENABLED
  ? "-9" // A fixed negative decimal value used for quick testing during development.
  : require("fs") // Dynamically loads the Node.js 'fs' (file system) module.
    .readFileSync("/dev/stdin", { encoding: "utf8" }) // Reads the entire content of standard input as a UTF-8 string.
    .trim(); // Removes any leading or trailing whitespace characters from the input string.

/**
 * Executes the core logic to convert a decimal integer (represented as a string)
 * into its negabinary (base -2) string form. This conversion algorithm is capable
 * of handling positive, negative, and zero decimal inputs correctly.
 *
 * @param {string} inputDecimalString The string containing the decimal integer to be converted.
 * @returns {string} A string representing the negabinary equivalent of the input.
 *                   Returns "0" if the input evaluates to zero or cannot be parsed into a number.
 */
const transformDecimalToNegabinary = (inputDecimalString) => {
  // Define the base for the conversion, which is fixed at -2 for negabinary.
  const NEGABINARY_BASE_VALUE = -2;

  // Attempt to parse the input string into a base-10 integer.
  let currentWorkingDecimal = Number.parseInt(inputDecimalString, 10);
  // Initialize an empty string that will accumulate the negabinary digits.
  let accumulatedNegabinaryDigits = "";

  // Early exit condition: If the input number is zero, its negabinary representation is simply "0".
  if (currentWorkingDecimal === 0) {
    if (TRACE_EXECUTION_ENABLED) {
      console.info(`[DEBUG INFO] Input was zero, directly returning "0".`);
    }
    return "0";
  }

  // The main conversion loop continues as long as the current decimal value is not zero.
  while (currentWorkingDecimal !== 0) {
    // Calculate the remainder when dividing by the negabinary base.
    let digitRemainder = currentWorkingDecimal % NEGABINARY_BASE_VALUE;
    // Calculate the provisional quotient.
    let preliminaryQuotient = currentWorkingDecimal / NEGABINARY_BASE_VALUE;

    // Log the state of variables for debugging if enabled.
    if (TRACE_EXECUTION_ENABLED) {
      console.log(`[TRACE] Current: ${currentWorkingDecimal}, Remainder: ${digitRemainder}, Quotient: ${preliminaryQuotient}`);
    }

    // Negabinary arithmetic requires special handling for negative remainders.
    // If the remainder is negative, it needs to be adjusted along with the quotient.
    if (digitRemainder < 0) {
      // Convert the negative remainder to its positive equivalent (0 or 1 for base -2).
      digitRemainder = Math.abs(digitRemainder); // Equivalent to digitRemainder = -digitRemainder;
      // Adjust the current decimal value (quotient) by adding 1, compensating for the remainder change.
      currentWorkingDecimal = Math.trunc(preliminaryQuotient) + 1;
    } else {
      // If the remainder is non-negative, simply truncate the quotient for the next iteration.
      currentWorkingDecimal = Math.trunc(preliminaryQuotient);
    }

    // Prepend the current digit (remainder) to the accumulated result string.
    // This builds the negabinary number in reverse order, which is correct.
    accumulatedNegabinaryDigits = String(digitRemainder) + accumulatedNegabinaryDigits;
  }

  // After the loop, if tracing is enabled, log the final result.
  if (TRACE_EXECUTION_ENABLED) {
    console.info(`[DEBUG INFO] Conversion complete. Result: ${accumulatedNegabinaryDigits}`);
  }

  // Return the final negabinary string.
  return accumulatedNegabinaryDigits;
};

// Initiate the conversion process using the obtained input string.
const resultantNegabinaryString = transformDecimalToNegabinary(providedInputString);

// Output the final negabinary string to the console.
console.log(resultantNegabinaryString);