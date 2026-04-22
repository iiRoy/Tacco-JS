// This utility function takes an input string and produces a modified string
// composed entirely of 'x' characters, with a length matching the original input.
function processInputData(incomingText) {
  // Validate and ensure the input is treated as a string.
  // If `incomingText` is null or undefined, it defaults to an empty string.
  const originalContent = String(incomingText || '');

  // Early exit condition: If the content is empty, there's no pattern to generate.
  if (originalContent.length === 0) {
    console.warn("Input content is empty. No pattern was generated.");
    // No explicit return value is needed for this operation.
    return;
  }

  // Determine the exact character count of the processed input.
  const contentCharCount = originalContent.length;

  // Construct the repeating pattern.
  // Using Array(N+1).join('char') is an alternative to String.prototype.repeat(N).
  // This creates an array of N empty strings, then joins them with 'x',
  // resulting in N 'x' characters.
  const generatedPattern = Array(contentCharCount + 1).join('x');

  // Output the final generated pattern to the console.
  console.log(generatedPattern);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream,
// typically used for command-line execution or competitive programming.
try {
  // Dynamically load the Node.js file system module for input operations.
  const fileSystemModule = require("fs");

  // Read the entire content of '/dev/stdin' synchronously as a UTF-8 string.
  // This file path is common for standard input in Unix-like environments.
  const rawStreamData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Pass the read data to our core processing function after trimming
  // any leading or trailing whitespace characters.
  processInputData(rawStreamData.trim());
} catch (inputReadError) {
  // In case of any error during file reading (e.g., file not found, permissions),
  // log the error and proceed with an empty string to prevent application crash.
  console.error("Failed to read input from /dev/stdin:", inputReadError.message);
  // Optionally, process with a default empty string if input acquisition fails.
  processInputData("");
}