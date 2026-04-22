const fileSystemUtilityModule = require("fs");

// Define the standard input file path as a constant
const STDIN_PATH_CONSTANT = "/dev/stdin";

// Define the upper limit for the bit exponent check (0 to 9, so 10 iterations)
const MAXIMUM_BIT_POSITION_LIMIT = 10;

/**
 * Decomposes a given numeric string into its constituent powers of two.
 * For example, "5" becomes "1 4", "6" becomes "2 4".
 * Handles validation for input and returns a specific string for invalid cases.
 *
 * @param {string} inputLineString The string representation of a number to decompose.
 * @returns {string} A space-separated string of powers of two, or an error/skip indicator.
 */
function processAndDecomposeNumericInput(inputLineString) {
  // Use a temporary array to collect the powers of two
  const collectedPowerComponents = [];

  // Attempt to convert the input string to an integer, explicitly specifying radix 10
  const numericalRepresentation = parseInt(inputLineString.trim(), 10);

  // Validate the parsed number: must be a non-negative integer
  if (isNaN(numericalRepresentation) || numericalRepresentation < 0 || !Number.isInteger(numericalRepresentation)) {
    // For invalid input, return a distinct string to indicate it should be skipped or logged
    return "SKIPPED_INVALID_ENTRY";
  }

  // Iterate from exponent 0 up to (but not including) the maximum limit
  for (let currentExponentValue = 0; currentExponentValue < MAXIMUM_BIT_POSITION_LIMIT; currentExponentValue++) {
    // Calculate the current power of two (2^currentExponentValue)
    const powerOfTwoValue = Math.pow(2, currentExponentValue);

    // Check if the current bit is set in the numericalRepresentation using bitwise AND
    // If the result of the bitwise AND is non-zero, it means the bit is set
    if ((numericalRepresentation & powerOfTwoValue) !== 0) {
      collectedPowerComponents.push(powerOfTwoValue);
    }
  }

  // Join the collected power components into a single space-separated string
  return collectedPowerComponents.join(" ");
}

// Main execution block for reading input and processing
try {
  // Read the entire content of the standard input file synchronously
  // Ensure 'utf8' encoding for text and remove any leading/trailing whitespace from the whole content
  const rawDataFromSource = fileSystemUtilityModule.readFileSync(STDIN_PATH_CONSTANT, { encoding: "utf8" }).trim();

  // Split the raw content into an array of individual lines
  const dataLineArray = rawDataFromSource.split("\n");

  // Iterate over each line in the array to process it
  // Using forEach because the primary action is a side effect (logging to console),
  // not transforming the array into a new one.
  dataLineArray.forEach((individualLineContent) => {
    // Skip processing if the line is empty after trimming whitespace
    if (individualLineContent.trim() === "") {
      return; // Move to the next line
    }

    // Call the helper function to get the processed output string for the current line
    const finalProcessedOutput = processAndDecomposeNumericInput(individualLineContent);

    // Only log valid outputs, skip messages for invalid entries
    if (finalProcessedOutput !== "SKIPPED_INVALID_ENTRY") {
      console.log(finalProcessedOutput);
    }
  });

} catch (operationalError) {
  // Catch and report any errors that occur during file reading or initial processing
  console.error(`ERROR: An unexpected file system or processing issue occurred: ${operationalError.message}`);
  // Optionally, indicate failure to the operating system
  // process.exit(1);
}