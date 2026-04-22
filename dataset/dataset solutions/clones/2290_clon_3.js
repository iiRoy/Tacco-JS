// This module handles the primary data manipulation operations.
// It processes raw textual input to extract and reorder specific components.
function processInputContent(sourceData) {
  // Validate that the provided sourceData is indeed a string and not empty.
  if (typeof sourceData !== 'string' || sourceData.length === 0) {
    console.error("Error: Input data must be a non-empty string for processing.");
    return; // Exit early if the initial input is invalid.
  }

  // Step 1: Extract the first meaningful line from the input.
  // We split the entire input by common newline characters (CRLF or LF)
  // and then filter out any lines that are empty or contain only whitespace.
  const allLines = sourceData.split(/\r?\n/);
  const meaningfulLines = allLines.filter(line => line.trim().length > 0);

  // Guard clause: Ensure there's at least one non-empty line available to process.
  if (meaningfulLines.length === 0) {
    console.warn("Warning: No meaningful lines were found in the provided input content after filtering.");
    return; // Exit if no valid lines are present.
  }

  // We are specifically interested in the very first non-empty line for our logic.
  const relevantLine = meaningfulLines[0];

  // Step 2: Parse the `relevantLine` into individual segments using a space as the delimiter.
  const lineSegments = relevantLine.split(' ');

  // Guard clause: Ensure that the parsed line contains at least two segments,
  // which is a prerequisite for the required reordering operation.
  if (lineSegments.length < 2) {
    console.error("Error: The first meaningful input line does not contain at least two space-separated parts as expected.");
    return; // Exit if the line structure is incorrect.
  }

  // Step 3: Extract the specific segments needed for reordering.
  // The problem's requirement is to take the second part and then the first part.
  const segmentA = lineSegments[0]; // This holds the content of the first space-separated part.
  const segmentB = lineSegments[1]; // This holds the content of the second space-separated part.

  // Type III: Introduce an intermediate variable for clarity in constructing the final output string.
  // Using template literals provides a clean and readable way to concatenate strings.
  const constructedResult = `${segmentB}${segmentA}`;

  // Step 4: Output the final reordered string to the console.
  // The `console.log` function is the standard method for printing output in JavaScript environments.
  console.log(constructedResult);
}

// --- Main execution block for reading input and initiating processing ---
// This part handles reading the input from the system's standard input stream
// and then invokes our primary data processing function.
try {
  // Define the standard input file path, which is commonly used in Unix-like systems
  // for programs to receive input from pipes or redirected files.
  const standardInputFilePath = "/dev/stdin";

  // Utilize Node.js's built-in 'fs' (file system) module to synchronously read
  // the entire content of the specified standard input file.
  // The 'utf8' encoding is specified to correctly interpret text data.
  const rawSystemInput = require("fs").readFileSync(standardInputFilePath, "utf8");

  // Call our main data processing function with the raw content obtained from standard input.
  processInputContent(rawSystemInput);

} catch (ioError) {
  // In the event of any error occurring during the file reading process (e.g.,
  // file not found, permission issues, or other I/O problems),
  // an informative error message is printed to the console's error stream.
  console.error("An error occurred while attempting to read data from standard input:", ioError.message);
  // For production-grade applications, one might choose to exit the process
  // with a non-zero status code here to indicate failure:
  // process.exit(1);
}