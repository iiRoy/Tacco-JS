function processInputData(rawDataString) {
  /*
   * This module processes a raw string input containing three space-separated numerical values.
   * Its primary objective is to determine which of the two reference points (second or third value)
   * is numerically closer to the designated target value (the first value).
   * The outcome, 'A' for the first reference or 'B' for the second, is then communicated
   * to the standard output. Robust error handling is integrated for invalid inputs.
   */

  // Guard clause: Ensure the initial input is a non-empty string.
  if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Input Processing Error: The provided data is not a valid non-empty string.");
    return; // Terminate execution if input is invalid.
  }

  // Normalize the input string by removing leading/trailing whitespace.
  const sanitizedInputString = rawDataString.trim();

  // Helper function to parse and validate numeric components from the input string.
  const parseAndValidateNumericComponents = (sourceString) => {
    const stringSegments = sourceString.split(" ");

    // Validation: Check if exactly three numeric segments are provided.
    if (stringSegments.length !== 3) {
      console.error("Input Format Mismatch: Expected precisely three space-separated numeric values.");
      return null; // Indicate parsing failure.
    }

    // Convert string segments to numbers.
    const numericArray = stringSegments.map(segment => Number(segment));

    // Validation: Ensure all converted segments are legitimate numbers.
    if (numericArray.some(val => isNaN(val))) {
      console.error("Data Type Error: All input components must represent valid numbers.");
      return null; // Indicate parsing failure.
    }
    return numericArray; // Return the array of validated numbers.
  };

  // Attempt to parse the input into its constituent numeric parts.
  const parsedNumericalElements = parseAndValidateNumericComponents(sanitizedInputString);

  // Exit if the parsing and validation steps encountered an issue.
  if (parsedNumericalElements === null) {
    return;
  }

  // Destructure the validated numeric elements into clearly named variables.
  const [targetMeasurement, primaryReferencePoint, secondaryReferencePoint] = parsedNumericalElements;

  // Utility function to compute the absolute difference between two numerical values.
  const calculateAbsoluteDeviation = (valueOne, valueTwo) => {
    // This calculation is robust against the order of subtraction.
    return Math.abs(valueOne - valueTwo);
  };

  // Compute the absolute distances from the target to each reference point.
  const deviationToPrimary = calculateAbsoluteDeviation(targetMeasurement, primaryReferencePoint);
  const deviationToSecondary = calculateAbsoluteDeviation(targetMeasurement, secondaryReferencePoint);

  let finalDecisionIndicator = ""; // Variable to hold the 'A' or 'B' outcome.

  // Determine which reference point is closer to the target.
  if (deviationToPrimary < deviationToSecondary) {
    finalDecisionIndicator = "A"; // Primary reference is closer.
  } else {
    // If the primary is not strictly closer, the secondary is either closer or equidistant.
    // The original problem implies 'B' for equality or if 'B' is closer.
    finalDecisionIndicator = "B"; // Secondary reference is closer or equally close.
  }

  // Helper function for consistent output presentation.
  const displayResultToConsole = (outputMessage) => {
    console.log(outputMessage);
  };

  // Present the determined outcome.
  displayResultToConsole(finalDecisionIndicator);
}

// Self-executing anonymous function to manage the program's entry point and environment setup.
(function applicationRunner() {
  // Attempt to read the input from the standard input stream.
  try {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    // Invoke the main processing function with the obtained input.
    processInputData(rawSystemInput);
  } catch (executionError) {
    // Handle potential errors during file reading or execution.
    console.error("Application Execution Failure: Could not read input or process data.");
    console.error(`Details: ${executionError.message}`);
    // Suggest corrective action to the user.
    console.error("Ensure '/dev/stdin' is properly configured and accessible for reading.");
  }
})();