// Function to determine if a value falls within a range defined by two other values.
// This function acts as the primary entry point for processing data.
function evaluateRangeInclusion(rawInputString) {
  // Define constants for output messages for better maintainability.
  const POSITIVE_RESPONSE_TEXT = "Yes";
  const NEGATIVE_RESPONSE_TEXT = "No";

  // Helper function to display the final outcome.
  // This abstracts the console logging for potential future changes (e.g., UI output).
  const emitOutcome = (resultString) => {
    console.log(resultString);
  };

  // --- Data Preparation and Initial Validation ---
  // Ensure the input string is not null, undefined, or empty before processing.
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    // If input is invalid, we output 'No' as a graceful failure.
    emitOutcome(NEGATIVE_RESPONSE_TEXT);
    return;
  }

  // Remove leading/trailing whitespace from the raw input string.
  // Then, split the string by spaces to get individual string components.
  let stringRepresentations = rawInputString.trim().split(" ");

  // Declare an array to hold the numeric representations of the input.
  let convertedNumericValues = [];

  // Iterate over each string component and convert it to an integer.
  // Include a validation step to ensure all components are valid numbers.
  for (let i = 0; i < stringRepresentations.length; i++) {
    const currentSegment = stringRepresentations[i];
    const parsedInteger = parseInt(currentSegment, 10); // Explicit radix for robust parsing.

    if (isNaN(parsedInteger)) {
      // If any segment cannot be converted to a number, the input is invalid for this logic.
      emitOutcome(NEGATIVE_RESPONSE_TEXT);
      return;
    }
    convertedNumericValues.push(parsedInteger);
  }

  // --- Input Validation (Structure) ---
  // Ensure we have exactly three numbers as expected for the range check operation.
  const REQUIRED_NUMBER_COUNT = 3;
  if (convertedNumericValues.length !== REQUIRED_NUMBER_COUNT) {
    // If the number count is not as expected, output 'No'.
    emitOutcome(NEGATIVE_RESPONSE_TEXT);
    return;
  }

  // --- Core Logic: Range Inclusion Check ---
  // Extract the individual values into descriptive variables for enhanced readability.
  const primaryBoundaryValue = convertedNumericValues[0];
  const secondaryBoundaryValue = convertedNumericValues[1];
  const valueToExamine = convertedNumericValues[2];

  // Determine the minimum and maximum of the two boundary values.
  // This approach simplifies the subsequent range comparison logic.
  const lowerBoundOfRange = Math.min(primaryBoundaryValue, secondaryBoundaryValue);
  const upperBoundOfRange = Math.max(primaryBoundaryValue, secondaryBoundaryValue);

  // Check if the valueToExamine falls inclusively within the calculated range.
  let isValueWithinDefinedRange = (valueToExamine >= lowerBoundOfRange && valueToExamine <= upperBoundOfRange);

  // --- Output Result ---
  // Based on the range inclusion check, display the appropriate response.
  if (isValueWithinDefinedRange) {
    emitOutcome(POSITIVE_RESPONSE_TEXT);
  } else {
    emitOutcome(NEGATIVE_RESPONSE_TEXT);
  }
}

// --- Program Execution Entry Point ---
// This self-executing function encapsulates the logic for reading input
// from standard input and invoking the main processing function.
(function initiateInputReadingAndProcessing() {
  try {
    // Utilize Node.js 'fs' module to synchronously read data from stdin.
    // Specify UTF-8 encoding for proper text interpretation.
    const fileSystemUtility = require("fs");
    const stdInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

    // Pass the raw content read from stdin to our main processing function.
    evaluateRangeInclusion(stdInputContent);
  } catch (operationError) {
    // Catch and handle any potential errors that may occur during file reading
    // or the initial stages of input processing.
    console.error("An unexpected error occurred during input acquisition or processing:", operationError.message);
    console.log("No"); // Output 'No' as a default fallback in case of an error.
  }
})();