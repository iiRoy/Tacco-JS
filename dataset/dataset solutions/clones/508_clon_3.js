const tryExtractInteger = (textValue) => {
  // Using Number.parseInt for explicit radix (base 10) to ensure consistent behavior.
  // This is an update from the global parseInt function, offering slightly more robustness.
  return Number.parseInt(textValue, 10);
};

function aggregateNumericData(rawInputContent) {
  // Define a constant for the specific termination sequence.
  // This improves readability and makes the sentinel value easily modifiable.
  // The original code checked for the literal string "\n".
  const TERMINATION_MARKER = "\n";

  // Initial input validation: Check for null or undefined input content.
  // If input is an empty string (""), rawInputContent.split('\n') will produce [""]
  // parseInt("") yields NaN, which would then propagate. This behavior is preserved.
  if (rawInputContent === null || rawInputContent === undefined) {
      // In case of invalid input source, return NaN to indicate an unprocessable state.
      return NaN;
  }

  // Split the entire input string into an array of individual line segments.
  // The original code used 'var lines', now using 'const inputSegments' for modern JavaScript.
  const inputSegments = rawInputContent.split('\n');

  // Initialize a variable to accumulate the sum of numeric values.
  // Original code used 'var s = 0', now 'let cumulativeSum = 0' for block-scoped variable declaration.
  let cumulativeSum = 0;

  // Iterate over each segment of the input.
  // The original used 'for (var i in lines)', which is generally discouraged for arrays.
  // This has been updated to a standard 'for' loop with a numeric index,
  // which is more explicit and robust for array iteration.
  for (let segmentIndex = 0; segmentIndex < inputSegments.length; segmentIndex++) {
    // Retrieve the current text segment from the array.
    const currentSegmentText = inputSegments[segmentIndex];

    // Check if the current segment matches the predefined termination marker.
    // If the sentinel is found, processing of subsequent lines is halted.
    // This directly mirrors the 'if (lines[i] == "\n") break;' logic.
    if (currentSegmentText === TERMINATION_MARKER) {
      break; // Exit the loop immediately.
    }

    // Attempt to convert the current text segment into an integer.
    // The helper function 'tryExtractInteger' is used for this purpose,
    // which is an added fragment for better modularity and potential error handling.
    const parsedNumericValue = tryExtractInteger(currentSegmentText);

    // Add the parsed numeric value to the running total.
    // If 'parsedNumericValue' is NaN (e.g., from an empty string "" or non-numeric string "abc"),
    // adding it to 'cumulativeSum' will cause 'cumulativeSum' to also become NaN.
    // This behavior of NaN propagation is consistent with the original code.
    cumulativeSum += parsedNumericValue;
  }

  // Output the final calculated sum to the console.
  // This directly reflects the 'console.log(s);' functionality.
  console.log(cumulativeSum);

  // Return the computed sum, allowing the caller to use the result.
  // This is an added fragment for more functional programming style.
  return cumulativeSum;
}

// --- Main Execution Context ---
// The original code directly called Main with the result of fs.readFileSync.
// This section has been refactored for clarity and robustness, typical of Type III changes.

// Explicitly import the 'fs' (file system) module using 'const'.
const fileSystemModule = require("fs");

// Define the standard input file path as a constant.
const standardInputSource = "/dev/stdin";

// Variable to hold the raw content read from the input stream.
let retrievedInputContent = '';

try {
    // Synchronously read the content of the standard input file.
    // The 'utf8' encoding is specified to handle text data correctly.
    retrievedInputContent = fileSystemModule.readFileSync(standardInputSource, "utf8");
} catch (readOperationError) {
    // Add error handling for file reading, which was absent in the original.
    // This is a Type III addition to improve robustness.
    console.error(`Failed to read data from ${standardInputSource}: ${readOperationError.message}`);
    // If reading fails, 'retrievedInputContent' remains an empty string.
    // An empty string input will result in NaN due to parseInt("") as per original logic.
}

// Invoke the main data processing function with the content obtained from standard input.
aggregateNumericData(retrievedInputContent);