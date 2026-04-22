// This module is designed to process incoming textual data,
// specifically identifying occurrences of a predefined string token
// and reporting their 1-based positional indices within the sequence.

/**
 * Analyzes a given string, splitting it into individual segments
 * and then locating all instances of the specific target string '0'.
 * For each found instance, its 1-based index is printed to the console.
 *
 * @param {string} sourceDataString - The primary string input for analysis.
 *                                    It is expected to contain space-delimited components.
 */
const analyzeSequence = (sourceDataString) => {
  // Defensive programming: Validate the type of the input parameter.
  // If the input is not a string, an error message is displayed, and the function exits early.
  if (typeof sourceDataString !== 'string') {
    console.error("Processing Aborted: Input data must be of string type for sequence analysis.");
    return; // Guard clause: prevents further execution with invalid data.
  }

  // Split the raw input string into an array of tokens using a single space as the delimiter.
  // This approach retains empty strings if multiple spaces are present, mimicking original behavior.
  const tokenCollection = sourceDataString.split(' ');

  // Declare the specific string value that the analysis routine is searching for.
  const zeroStringIdentifier = '0';

  // Cache the total number of segments in the collection for efficient loop control.
  const numberOfSegments = tokenCollection.length;

  // Iterate through each segment in the `tokenCollection` array.
  // The loop variable `segmentIndex` is block-scoped using `let` and uses pre-increment for minor optimization.
  for (let segmentIndex = 0; segmentIndex < numberOfSegments; ++segmentIndex) {
    // Retrieve the current segment's value from the collection.
    const currentSegmentValue = tokenCollection[segmentIndex];

    // Evaluate if the current segment's value strictly matches the `zeroStringIdentifier`.
    const doesSegmentMatchTarget = (currentSegmentValue === zeroStringIdentifier);

    // If a match is found for the target identifier.
    if (doesSegmentMatchTarget) {
      // Calculate the human-readable, 1-based index for the found segment.
      const adjustedDisplayIndex = segmentIndex + 1;
      // Output the calculated position to the standard output stream.
      console.log(adjustedDisplayIndex);
    } else {
      // This 'else' block can be utilized for optional debugging or logging purposes.
      // It represents an added fragment of code that doesn't alter core functionality.
      // For instance, one might log tokens that are not the target:
      // console.debug(`Encountered non-target token at raw index ${segmentIndex}: '${currentSegmentValue}'`);
    }
  }
};

// --- Application Entry Point and Input Handling ---

// Define constants for external module access and system paths to improve clarity and maintainability.
const fileSystemAccess = require('fs'); // Renamed constant for the file system module.
const standardInputEndpoint = '/dev/stdin'; // Renamed constant for the standard input file path.
const textEncodingStandard = 'utf8'; // Renamed constant for the character encoding.

/**
 * A utility function designed to safely retrieve content from a specified file path.
 * It incorporates robust error handling for common file system operation failures.
 *
 * @param {string} filePath - The absolute or relative path to the file that needs to be read.
 * @returns {string} The entire content of the file, decoded as a string.
 * @throws {Error} If any I/O error occurs during the file reading process, the program will terminate.
 */
const retrieveFileContent = (filePath) => {
  let fileContentBuffer; // Declaring variable before `try` block for scope availability.
  try {
    // Synchronously read the entire content of the file using the specified encoding.
    fileContentBuffer = fileSystemAccess.readFileSync(filePath, textEncodingStandard);
  } catch (ioOperationError) {
    // In case of any error during file reading (e.g., file not found, permissions issue),
    // an error message is logged to standard error, and the process is terminated.
    console.error(`CRITICAL ERROR: Failed to access input file at '${filePath}'. Details: ${ioOperationError.message}`);
    // Exiting with a non-zero status code indicates that the program terminated abnormally.
    process.exit(1); // Added new fragment: explicit process termination on critical error.
  }
  return fileContentBuffer; // Return the successfully read file content.
};

// Execute the main processing workflow:
// 1. Obtain the raw data string from the designated standard input source.
const rawInputDataString = retrieveFileContent(standardInputEndpoint);

// 2. Pass the obtained raw data string to the primary analysis function.
analyzeSequence(rawInputDataString);