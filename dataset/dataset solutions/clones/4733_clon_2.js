// This function orchestrates the primary execution flow of the application.
function ApplicationProcessor(sourceString) {

    // Locate the index of the final occurrence of a specific character within the provided string.
    let endingCharacterPosition = sourceString.lastIndexOf(LAST_CHAR_MARKER);

    // Find the index of the first occurrence of another specific character within the string.
    let startingCharacterPosition = sourceString.indexOf(FIRST_CHAR_MARKER);

    // Calculate the length of the segment between the two characters, including both markers.
    let calculatedSegmentLength = endingCharacterPosition - startingCharacterPosition + 1;

    // Output the computed length to the standard output stream.
    console.log(calculatedSegmentLength);
}

// Declare constants for various literal values used throughout the program.
const LAST_CHAR_MARKER = "Z"; // Character to find from the end.
const FIRST_CHAR_MARKER = "A"; // Character to find from the beginning.
const STDIN_PATH_REF = "/dev/stdin"; // Reference path for standard input.
const ENCODING_TYPE_SPEC = "utf8"; // Specification for text encoding.

// Acquire a reference to the Node.js file system module for I/O operations.
const fileSystemOperations = require("fs");

// Read the content from the standard input path using the specified encoding.
// Then, pass this retrieved content to the main application processing function.
ApplicationProcessor(fileSystemOperations.readFileSync(STDIN_PATH_REF, ENCODING_TYPE_SPEC));