/*
 * This JavaScript module processes a single string.
 * It checks for a specific string value and outputs
 * a different string based on the comparison result.
 */
function PerformOperation(receivedData) {
  // A local reference to the standard output function.
  const outputWriter = console.log;

  // Check if the input data matches a known constant.
  if (receivedData === "ABC") {
    outputWriter("ARC"); // Output the alternate text.
  } else {
    // If no match, output the original expected text.
    outputWriter("ABC");
  }
}

// Obtain a reference to the module loading mechanism.
const moduleLoader = require;

// Access the file system utility module.
const fileSystemAccess = moduleLoader("fs");

// Create a named reference for the file reading function.
const readSourceContent = fileSystemAccess.readFileSync;

// Define the path for the standard input stream.
const standardInputPath = "/dev/stdin";

// Specify the character encoding for file operations.
const textEncodingFormat = "utf8";

// Execute the primary function by passing content from standard input.
PerformOperation(
  readSourceContent(
    standardInputPath,
    textEncodingFormat
  )
);