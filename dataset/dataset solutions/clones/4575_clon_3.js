// This module processes a string of numerical data to determine if a specific value falls within a given range.
function AnalyzeNumericRange(sourceText) {
  // Initialize a variable to hold the final decision message.
  // Defaulting to 'No' assumes the condition is not met until proven otherwise.
  let outcomeMessage = 'No';

  // --- Stage 1: Initial Input Validation and Segmentation ---
  // Ensure the provided input string is not null, undefined, or merely empty whitespace.
  // An invalid input string cannot be processed.
  if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length === 0) {
    // In a production scenario, this might throw an error or return a specific error code.
    // For this context, we'll log to console.error and terminate the function.
    console.error("Error: The provided input data is either empty, not a string, or consists only of whitespace.");
    return;
  }

  // Split the cleaned input string into an array of individual components.
  // Using a regular expression `/\s+/` handles multiple spaces between numbers robustly.
  // `trim()` removes leading/trailing whitespace before splitting.
  const dataSegments = sourceText.trim().split(/\s+/);

  // Define the expected number of numerical parameters.
  const EXPECTED_PARAM_COUNT = 3; // Corresponds to A, B, and C.

  // Verify that enough segments were extracted from the input string.
  // If not, the input is incomplete for the range check.
  if (dataSegments.length < EXPECTED_PARAM_COUNT) {
    console.error(`Error: Insufficient data segments provided. Expected ${EXPECTED_PARAM_COUNT} values, but found ${dataSegments.length}.`);
    return;
  }

  // --- Stage 2: Data Type Conversion and Numeric Validation ---
  // Convert the first three string segments into numerical types.
  // The `map(Number)` function attempts to convert each string element to a number.
  const numericalValues = dataSegments.slice(0, EXPECTED_PARAM_COUNT).map(Number);

  // After conversion, check if any of the resulting values are 'NaN' (Not a Number).
  // This indicates that the original string segment could not be parsed into a valid number.
  if (numericalValues.some(isNaN)) {
    console.error("Error: One or more input segments could not be successfully converted into valid numerical values.");
    return;
  }

  // Assign the converted numerical values to clearly named variables.
  // This enhances readability compared to directly using array indices.
  const lowerBoundaryValue = numericalValues[0]; // This corresponds to 'A' from the original problem.
  const upperBoundaryValue = numericalValues[1]; // This corresponds to 'B'.
  const valueToExamine = numericalValues[2];   // This corresponds to 'C'.

  // --- Stage 3: Core Logic - Range Evaluation ---
  // Implement the primary condition check: Is 'valueToExamine' inclusively between 'lowerBoundaryValue' and 'upperBoundaryValue'?
  // A boolean flag makes the condition's outcome explicit.
  const isConditionMet = (valueToExamine >= lowerBoundaryValue) && (valueToExamine <= upperBoundaryValue);

  // --- Stage 4: Result Formulation and Output ---
  // Based on the evaluation, update the outcome message.
  if (isConditionMet) {
    outcomeMessage = 'Yes';
  } else {
    // This 'else' block explicitly sets the message to 'No',
    // which is redundant given its initial assignment, but adds clarity to the flow.
    outcomeMessage = 'No';
  }

  // Finally, display the determined outcome.
  console.log(outcomeMessage);
}

// --- Standard Input Handling ---
// This section is responsible for reading input from the standard input stream
// and passing it to the main processing function.
// As per the instructions, this part should remain untouched to preserve
// compatibility with the standard execution environment.
// Do not modify below this line.
AnalyzeNumericRange(require("fs").readFileSync("/dev/stdin", "utf8"));