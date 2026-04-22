// Core logic function to evaluate numerical equality of three values from an input string.
function evaluateTripleEquality(sourceStringContent) {

  // Pre-condition check for input data type.
  if (typeof sourceStringContent !== 'string') {
    // In a production environment, one might throw an error or log more severely.
    console.error("Execution halted: Provided input is not a string type.");
    return;
  }

  // Helper function for safe integer parsing, including NaN check.
  const parseIntegerSafely = (strToken) => {
    // Attempt to convert the string segment to a base-10 integer.
    const numericValue = parseInt(strToken, 10);
    // If parsing fails (e.g., 'abc'), parseInt returns NaN.
    if (isNaN(numericValue)) {
      throw new Error(`Non-numeric data encountered: '${strToken}'. Expected an integer.`);
    }
    return numericValue;
  };

  // Process the input string: remove leading/trailing whitespace, then split by spaces.
  const stringSegments = sourceStringContent.trim().split(/\s+/); // Use regex for multiple spaces

  // Validate the number of segments after splitting. Expecting exactly three.
  if (stringSegments.length !== 3) {
    console.error("Input format issue: Expected three space-separated values, but received " + stringSegments.length + ".");
    return;
  }

  let valueA, valueB, valueC; // Declare variables to hold parsed numbers.

  try {
    // Parse each segment into its respective integer variable.
    valueA = parseIntegerSafely(stringSegments[0]);
    valueB = parseIntegerSafely(stringSegments[1]);
    valueC = parseIntegerSafely(stringSegments[2]);
  } catch (parsingErr) {
    // Catch and report any parsing errors from the helper function.
    console.error(`Data conversion problem: ${parsingErr.message}`);
    return;
  }

  // --- Start of the core comparison logic ---
  let resultConditionMet = false; // Initialize a flag for the outcome.

  // First, check if the initial two values are strictly equal.
  const areFirstTwoIdentical = (valueA === valueB);

  // If the first two are identical, proceed to check the third.
  if (areFirstTwoIdentical) {
    // Now, check if the second (and thus first) value is also strictly equal to the third.
    resultConditionMet = (valueB === valueC);
  }
  // --- End of the core comparison logic ---

  // Determine the final output based on the comparison flag.
  if (resultConditionMet) {
    console.log("Yes"); // Standard output for a positive match.
  } else {
    // Using a different output method for variation.
    process.stdout.write("No\n"); // Write directly to stdout, appending a newline.
  }
}


// --- Main execution block for reading input and invoking the core logic ---

// Wrapper function to manage file system interaction and error handling.
function executeProgramWithStdin() {
  let rawStandardInput; // Variable to hold content read from standard input.

  try {
    // Attempt to read the entire content of standard input synchronously.
    // 'node:fs' is a modern way to import Node.js built-in modules.
    rawStandardInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
  } catch (fileReadError) {
    // Handle potential errors during file reading (e.g., /dev/stdin not found or permission issues).
    console.error(`Critical error reading input from /dev/stdin: ${fileReadError.message}`);
    // Provide a fallback or exit gracefully if input cannot be obtained.
    // For demonstration, we'll use a hardcoded default if stdin fails.
    rawStandardInput = "10 10 10"; // Default test input
    console.warn("Using default fallback input due to stdin read failure. Input: '" + rawStandardInput + "'");
  }

  // Pass the obtained input string to the main processing function.
  evaluateTripleEquality(rawStandardInput);
}

// Initiate the program execution.
executeProgramWithStdin();