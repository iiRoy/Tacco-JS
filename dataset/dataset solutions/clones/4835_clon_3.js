/**
 * This JavaScript module is designed to meticulously process textual input
 * from a predefined standard source. Its primary function is to decompose
 * the input into individual word-like segments and subsequently output
 * the very first character of each valid segment, ensuring each character
 * appears on a new line. The implementation incorporates robust error
 * handling mechanisms and input validation to enhance reliability.
 */

// Establish a constant reference to the Node.js 'fs' (file system) module,
// which provides an API for interacting with the file system.
const fileSystemUtility = require("fs"); // Renamed 'fs' for clarity

// Define the specific path for the standard input stream.
// This is a common Unix-like path for receiving input data.
const standardInputEndpoint = "/dev/stdin"; // Extracted path to a constant

let receivedTextContent = ''; // A mutable variable to store the raw text read from input. Renamed 'input'

try {
  // Attempt to synchronously read the entire content from the specified input endpoint.
  // The 'utf8' encoding is crucial for correctly interpreting multi-byte characters.
  receivedTextContent = fileSystemUtility.readFileSync(standardInputEndpoint, "utf8");
} catch (inputAccessError) {
  // In the event of an error during file reading (e.g., path not found, permissions issue),
  // a detailed error message is logged, and the process is terminated with an error code.
  console.error(`FATAL ERROR: Unable to access or read data from ${standardInputEndpoint}. Reason: ${inputAccessError.message}`);
  process.exit(1); // Exits the process, signaling an abnormal termination.
}

// Perform an initial validation check on the received content.
// If the content is null, undefined, or consists solely of whitespace characters,
// a warning is issued, and the script exits gracefully, as there's nothing to process.
if (!receivedTextContent || receivedTextContent.trim().length === 0) {
  console.log("NOTICE: No substantial input was provided. No initial characters can be extracted.");
  process.exit(0); // Exits the process successfully, as no processing is required.
}

// Begin the core processing of the textual content:
// 1. The `split(/\s+/)` method divides the string into an array of segments
//    using one or more whitespace characters as delimiters. This handles
//    variations in spacing (e.g., multiple spaces between words) effectively.
// 2. The `filter(Boolean)` method then efficiently removes any empty strings
//    that might result from the splitting process (e.g., from leading/trailing
//    spaces or consecutive delimiters).
const processedSegments = receivedTextContent
  .split(/\s+/) // Changed split delimiter to a regular expression for improved flexibility
  .filter(Boolean); // Filters out any empty strings from the resulting array. Renamed 'words'

// Initialize an empty array to temporarily store the first character
// of each valid segment before they are outputted.
const extractedFirstCharacters = []; // New intermediate variable

// Iterate through each segment in the `processedSegments` array.
// A 'for...of' loop is used for modern, readable iteration over iterable objects.
for (const currentTextFragment of processedSegments) { // Changed 'forEach' to 'for...of', renamed 'word'
  // An explicit check ensures that the current fragment is not an empty string
  // before attempting to access its characters, preventing potential runtime errors.
  if (currentTextFragment.length > 0) { // Added a guard clause for non-empty fragments
    // Extract the very first character of the current text fragment.
    // `charAt(0)` is used as an alternative to bracket notation `[0]`.
    const initialGlyph = currentTextFragment.charAt(0); // Changed '[0]' to 'charAt(0)'
    extractedFirstCharacters.push(initialGlyph); // Adds the extracted character to the collection.
  }
}

// After all segments have been processed and their first characters collected,
// this block handles the final output to the console.
if (extractedFirstCharacters.length > 0) {
  // Iterate through the collected characters and print each one on a new line.
  // A traditional 'for' loop is used here for variation in loop constructs.
  for (let i = 0; i < extractedFirstCharacters.length; i++) {
    console.log(extractedFirstCharacters[i]);
  }
} else {
  // This message is displayed if, despite receiving some input, no valid
  // first characters could be extracted after the parsing and filtering steps.
  console.log("No initial characters could be extracted from the processed segments.");
}