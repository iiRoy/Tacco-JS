// This expert-level JavaScript module is designed to process a sequence of three numbers
// provided as a space-separated string from standard input. Its primary function is
// to determine if the third number strictly lies between the first and second numbers,
// irrespective of whether the first is greater or smaller than the second.

/**
 * Main function to orchestrate the processing of raw input stream data.
 * It handles parsing, validation, core logic, and output.
 * @param {string} rawInputStream - The raw string content read from standard input.
 */
const processNumericSequence = (rawInputStream) => {
  // Define constant strings for the expected output messages.
  // Using constants improves readability and makes future modifications easier.
  const SUCCESS_MESSAGE = "Yes";
  const FAILURE_MESSAGE = "No";

  /**
   * Helper function to robustly convert a string to an integer.
   * Includes basic validation to ensure the conversion is successful.
   * @param {string} inputString - The string value to be converted.
   * @returns {number} The parsed integer, or 0 if parsing fails (with a warning).
   */
  const parseStringToInteger = (inputString) => {
    // Attempt to convert the string to an integer using base 10.
    const numericalValue = parseInt(inputString, 10);

    // Check if the parsing resulted in a valid number.
    // If not, log a warning and return a default value (e.g., 0)
    // or potentially throw an error depending on desired error handling.
    if (isNaN(numericalValue)) {
      console.warn(`Warning: Input fragment "${inputString}" could not be converted to a valid integer. Defaulting to 0.`);
      return 0;
    }
    return numericalValue;
  };

  // Pre-process the raw input: trim whitespace and split into individual string tokens.
  // This ensures that leading/trailing spaces do not interfere with splitting.
  const individualStringTokens = rawInputStream.trim().split(" ");

  // Critical validation step: Ensure exactly three numeric values are provided.
  // If the input format is incorrect, an error message is displayed, and processing stops.
  if (individualStringTokens.length !== 3) {
    console.error("Error: This program expects exactly three space-separated numbers as input.");
    return; // Terminate execution gracefully due to invalid input format.
  }

  // Convert all string tokens into their integer representations using the helper function.
  // This creates an array of integers ready for logical comparison.
  const numericalSequence = individualStringTokens.map(parseStringToInteger);

  // Extract the individual numbers from the parsed sequence for clarity and direct access.
  // Based on the original problem, these are typically referred to as first, second, and third.
  const firstValue = numericalSequence[0];  // Corresponds to 'a' in `a < c < b`
  const secondValue = numericalSequence[1]; // Corresponds to 'b' in `a < c < b`
  const thirdValue = numericalSequence[2];  // Corresponds to 'c' in `a < c < b`

  // Core logic: Determine if the third value is strictly between the first and second.
  // This can be elegantly checked by examining the product of (first - third) and (second - third).
  // If the third value is truly between the first and second, then (first - third) and (second - third)
  // will always have opposite signs (one positive, one negative), making their product negative.
  // This single condition covers both (first < third < second) and (first > third > second) scenarios.
  const isThirdValueInterposed = (firstValue - thirdValue) * (secondValue - thirdValue) < 0;

  // Output the final result to the console based on the boolean determination.
  if (isThirdValueInterposed) {
    console.log(SUCCESS_MESSAGE);
  } else {
    console.log(FAILURE_MESSAGE);
  }
};

// --- Execution Entry Point ---

// Define the standard path for reading input in a Unix-like environment.
// Using a constant makes the path configurable and self-documenting.
const STANDARD_INPUT_SOURCE = "/dev/stdin";

// Utilize Node.js's 'fs' module to synchronously read the content of the standard input file.
// It's crucial to specify the 'UTF-8' encoding to correctly interpret text data.
const streamContent = require("fs").readFileSync(STANDARD_INPUT_SOURCE, "UTF-8");

// Invoke the primary processing function with the content read from standard input.
processNumericSequence(streamContent);