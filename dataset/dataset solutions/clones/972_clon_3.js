// Define immutable application configuration settings for data handling.
// This constant object encapsulates crucial operational parameters.
const executionParameters = {
  // Specifies the absolute or relative path to the input data source.
  // For standard input on Unix-like systems, this is typically '/dev/stdin'.
  dataPath: '/dev/stdin',
  // Defines the character sequence used to separate individual lines within the input data.
  // A newline character ('\n') is standard for Unix/Linux environments.
  lineDelimiter: '\n'
};

// Import the Node.js 'fs' (file system) module to handle file input/output operations.
const ioOperations = require('fs');

// Declare a mutable array to store the processed lines of content read from the input source.
let contentSegments = [];

// Implement a robust error-handling mechanism for file reading.
try {
  // Synchronously read the entire content of the file specified by 'dataPath' into a Buffer.
  const rawInputBuffer = ioOperations.readFileSync(executionParameters.dataPath);

  // Convert the raw Buffer content into a human-readable string using UTF-8 encoding.
  // UTF-8 is a widely compatible character encoding, replacing the more restrictive 'ascii'.
  const fullContentString = rawInputBuffer.toString('utf8');

  // Perform an initial validation: check if the retrieved content is substantively empty.
  // `trim()` removes leading/trailing whitespace, ensuring we catch genuinely empty files.
  if (!fullContentString.trim()) {
    console.error("Operation Aborted: The input data source appears to be empty or contains only ignorable whitespace.");
    // Terminate the execution process with an error code (1) to indicate failure.
    process.exit(1);
  }

  // Divide the complete content string into an array of individual lines,
  // using the predefined 'lineDelimiter' as the separation point.
  contentSegments = fullContentString.split(executionParameters.lineDelimiter);

  // Validate the structure of the input: ensure there are at least two distinct lines.
  // The program requires one line for the main text and another for the search pattern.
  if (contentSegments.length < 2) {
    console.error("Operation Aborted: Insufficient data lines provided. Expected a minimum of two lines (main text and search pattern).");
    process.exit(1);
  }

} catch (dataReadError) {
  // Catch and log any exceptions that occur during the file reading process.
  // This provides informative feedback regarding I/O issues.
  console.error(`Critical Error: An unhandled exception occurred during input data retrieval: ${dataReadError.message}`);
  // Ensure the application exits with an error status upon encountering a read failure.
  process.exit(1);
}

// Destructure the contentSegments array to assign the first two lines to meaningful variables.
// The first line is considered the primary text body.
const mainDocumentText = contentSegments[0];
// The second line is designated as the specific substring pattern to be located.
const targetSearchPattern = contentSegments[1];

// Initialize an empty array to meticulously record all discovered starting positions
// of the 'targetSearchPattern' within the 'mainDocumentText'.
const detectedPositions = [];
// Establish a dynamic offset pointer that indicates where the next search iteration should commence.
let currentSearchOffset = 0;
// A temporary variable to store the index returned by `indexOf` in each iteration.
let foundMatchIndex;

// Implement a preliminary guard clause: if the search pattern is empty, no meaningful search can occur.
// This prevents infinite loops or unnecessary processing.
if (targetSearchPattern.length === 0) {
  // Log a warning message to inform the user about the empty pattern.
  console.warn("Warning: The provided search pattern is an empty string. No occurrences can be found.");
} else {
  // Commence an iterative search through the 'mainDocumentText'.
  // The 'while' loop continues as long as `indexOf` successfully finds the pattern.
  while ((foundMatchIndex = mainDocumentText.indexOf(targetSearchPattern, currentSearchOffset)) !== -1) {
    // Upon finding a match, append its starting index to our collection of detected positions.
    detectedPositions.push(foundMatchIndex);
    // Advance the 'currentSearchOffset' to the character immediately following the current match.
    // This strategy ensures that overlapping occurrences of the pattern are also captured.
    currentSearchOffset = foundMatchIndex + 1;
  }
}

// Iterate through the array of all found starting positions.
// This loop is responsible for outputting each recorded index.
for (let outputIndex = 0; outputIndex < detectedPositions.length; outputIndex++) {
  // Print each specific starting index of an occurrence to the standard output.
  console.log(detectedPositions[outputIndex]);
}