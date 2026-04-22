function processNumericalInput(rawInputString) {
  // This function is responsible for analyzing a given string,
  // converting it into a numerical value, and then determining
  // if that number belongs to a predefined set of special integers.

  // Type III: Add an initial validation check for the input string.
  // The original code might implicitly fail or produce unexpected results
  // with non-string or empty inputs. This guard clause enhances robustness.
  if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    // Type II: Changed the output message for clarity and distinctness.
    return "INVALID_OR_EMPTY_INPUT_RECEIVED";
  }

  // Type II: Renamed the variable for the parsed number to be more descriptive.
  let convertedNumericValue;

  try {
    // Type III: Added `.trim()` to the input string to handle potential
    // leading or trailing whitespace, ensuring cleaner parsing.
    // Type II: The base parsing method `parseInt` is retained as it's suitable.
    convertedNumericValue = parseInt(rawInputString.trim(), 10);
  } catch (parsingException) {
    // Type III: Introduced explicit error handling for the parsing step.
    // While `parseInt` typically returns `NaN` for non-numeric strings
    // rather than throwing, this block demonstrates added robustness for
    // unexpected parsing issues in a Type III clone.
    console.error("An unexpected issue occurred during number conversion:", parsingException.message);
    return "NUMERIC_CONVERSION_FAILURE";
  }

  // Type III: Implement a specific guard clause to check if the parsing
  // resulted in a "Not a Number" value. This makes the validation explicit.
  if (isNaN(convertedNumericValue)) {
    return "PARSED_VALUE_IS_NOT_A_NUMBER";
  }

  // Type III: Define the set of special integers using an array constant.
  // This is a significant structural change from the original's inline `||` conditions.
  // It improves readability, maintainability, and allows for easier modification
  // of the target numbers.
  const predefinedSpecialNumbers = [3, 5, 7];

  // Type III: Rewrite the core conditional logic.
  // The original `if(X==3||5||7)` was a common JavaScript bug,
  // where `5` and `7` are truthy, causing the condition to always resolve to `true`.
  // This Type III clone *fixes* that bug by implementing the likely *intended* functionality:
  // checking if the `convertedNumericValue` is precisely one of the `predefinedSpecialNumbers`.
  // Using the `.includes()` method is a clear structural and functional update.
  const isValueAmongSpecialSet = predefinedSpecialNumbers.includes(convertedNumericValue); // Type III: New boolean flag.

  // Type II: Reformat the conditional block with different indentation and spacing.
  let finalOutcomeReport; // Type III: Intermediate variable to hold the result string.
  if (isValueAmongSpecialSet) {
    finalOutcomeReport = "AFFIRMATIVE_MATCH_DETECTED"; // Type II: Altered output string.
  }
  else {
    finalOutcomeReport = "NEGATIVE_NO_MATCH_FOUND"; // Type II: Altered output string.
  }

  return finalOutcomeReport;
}

// Type III: Wrap the entire application execution flow within an Immediately Invoked Function Expression (IIFE).
// This provides a self-contained scope, prevents global variable pollution,
// and replaces the explicit `main(...)` function call from the original.
(function initializeAndExecuteProcessing() {
  // Type II: Added a contextual comment for the input reading section.
  // This block handles the acquisition of raw input data from the system's standard input.

  // Type III: Use a descriptive constant to reference the built-in file system module.
  const systemInputOutput = require('fs');

  let acquiredRawInput = ''; // Type III: Explicitly declare and initialize the input variable.
  try {
    // Type III: Introduce robust error handling for the file read operation,
    // which was not present in the original code. This makes the application more resilient.
    // Type II: Reformat the `readFileSync` call and add a descriptive comment.
    // Reads all content from the standard input path, ensuring UTF-8 character encoding.
    acquiredRawInput = systemInputOutput.readFileSync('/dev/stdin', 'utf8');
  } catch (readingError) {
    // Type III: Log a detailed error message to the standard error stream
    // and terminate the process with a non-zero exit code, indicating failure.
    console.error("ERROR: Unable to read content from the standard input stream.", readingError.message);
    process.exit(1); // Type III: Explicitly exit the process on critical I/O failure.
  }

  // Type III: Invoke the primary data processing function and store its result.
  // Type II: Call the renamed function.
  const finalProcessingResult = processNumericalInput(acquiredRawInput);

  // Type III: Output the final result string to the console.
  // This replaces the direct `console.log` calls that were embedded
  // within the original `main` function's logic, promoting separation of concerns.
  console.log(finalProcessingResult);
})();