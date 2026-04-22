function analyzeNumericString(sourceString) {
  // Define a symbolic constant for the specific numeric value we are searching for.
  // This improves readability and maintainability compared to using a magic number.
  const TARGET_NUMERIC_VALUE = 9;

  // Pre-process the raw input string by removing any leading or trailing whitespace.
  // This ensures that the splitting operation starts with a clean string.
  const cleanedInputText = sourceString.trim();

  // Implement a guard clause: If the input string is empty after trimming,
  // it cannot contain the required numeric values, so we immediately return 'No'.
  if (cleanedInputText.length === 0) {
    return "No";
  }

  // Split the cleaned string into an array of substrings using one or more
  // whitespace characters as a delimiter. This is more robust than a single space.
  const stringTokens = cleanedInputText.split(/\s+/);

  // Initialize an empty array to store the successfully parsed numeric values.
  // This allows for explicit type conversion and error handling.
  const convertedNumericValues = [];

  // Iterate over each token obtained from splitting the input string.
  // This replaces the direct use of `map(Number)` for more granular control.
  for (let idx = 0; idx < stringTokens.length; idx++) {
    const currentToken = stringTokens[idx];
    // Attempt to convert the current string token into a floating-point number.
    const numericalRepresentation = Number(currentToken);

    // Validate the conversion: If the result is a valid number (not NaN),
    // add it to our collection of numeric values.
    if (!isNaN(numericalRepresentation)) {
      convertedNumericValues.push(numericalRepresentation);
    }
    // A Type III clone might choose to add a limit to how many numbers to parse,
    // or break early if enough relevant numbers are found. For this problem,
    // we only care about the first two, so we can stop pushing after the second.
    if (convertedNumericValues.length >= 2) {
        break; // Optimization: we only need the first two numbers for the check.
    }
  }

  // Another guard clause: If fewer than two valid numeric values were parsed,
  // the condition (checking the first two elements) cannot be met.
  if (convertedNumericValues.length < 2) {
    return "No";
  }

  // Introduce a boolean flag to track whether the target value has been found.
  // This makes the logic flow clearer than nested conditional returns.
  let isTargetValuePresent = false;

  // Check if the first parsed numeric value matches the target.
  if (convertedNumericValues[0] === TARGET_NUMERIC_VALUE) {
    isTargetValuePresent = true;
  }
  // If the target wasn't found in the first position, check the second.
  // This `else if` ensures we don't re-check if already found.
  else if (convertedNumericValues[1] === TARGET_NUMERIC_VALUE) {
    isTargetValuePresent = true;
  }

  // A simple helper function to generate the appropriate output string.
  // This encapsulates the final decision logic.
  const getFinalDecisionMessage = (foundStatus) => {
    return foundStatus ? 'Yes' : 'No';
  };

  // Return the final result message based on whether the target was found.
  return getFinalDecisionMessage(isTargetValuePresent);
}

// Immediately Invoked Function Expression (IIFE) to handle the execution context.
// This separates the core logic from the environment-specific I/O operations.
(function processStandardInputAndOutput() {
  // Utilize a try-catch block for robust error handling during file system operations.
  try {
    // Dynamically require the 'fs' module for file system interactions.
    const fileSystemModule = require("fs");
    // Read the entire content of standard input synchronously, decoding it as UTF-8.
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Invoke the primary analysis function with the content read from standard input.
    const processingResult = analyzeNumericString(rawInputContent);

    // Output the final result to standard output.
    console.log(processingResult);
  } catch (executionError) {
    // If any error occurs during input reading or processing, log the error
    // and provide a default "No" response to indicate failure or invalid input.
    console.error("An operational error occurred:", executionError.message);
    console.log("No"); // Fallback response in case of system-level issues.
  }
})();