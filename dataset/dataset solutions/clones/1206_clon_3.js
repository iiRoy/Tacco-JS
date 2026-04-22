const inputSourcePath = '/dev/stdin'; // Specifies the path for the standard input stream
const dataEncodingFormat = 'utf8';  // Defines the character encoding for file operations
const segmentSeparator = ' ';       // Character used to split the input string into parts

let rawFileData = ''; // Variable to hold the entire content read from the input source

// Attempt to read data from the specified path, handling potential I/O errors
try {
    // Synchronously read the file content using the Node.js 'fs' module
    rawFileData = require('fs').readFileSync(inputSourcePath, dataEncodingFormat);
} catch (readOperationError) {
    // If an error occurs during file access or reading, log the issue
    console.error(`An error occurred while accessing the input stream: ${readOperationError.message}`);
    rawFileData = ''; // Ensure the variable is an empty string on error to prevent further issues
}

// Define a utility function to convert a string segment into an integer
// This function also handles cases where the segment might not be a valid number
const convertToIntegerSafely = (textSegment) => {
    const numericValue = parseInt(textSegment, 10); // Parse string to integer (base 10)
    // Return the number if valid, otherwise return null to indicate a failed parse
    return isNaN(numericValue) ? null : numericValue;
};

// Check if the read data is empty or contains only whitespace after trimming
if (!rawFileData || rawFileData.trim().length === 0) {
    console.warn("No meaningful data was found in the input. Proceeding with an empty array of numbers.");
    // Initialize the final collection as empty if no valid input is present
    const numericResultSet = [];
    // In a more complex application, one might choose to exit or throw an error here.
}

// Split the raw file data into an array of string segments using the defined separator.
// The .filter(Boolean) step removes any empty strings that might result from
// multiple consecutive separators or leading/trailing separators.
const stringSegmentsCollection = rawFileData.split(segmentSeparator).filter(Boolean);

// Iterate over the string segments, converting each into an integer using the helper function.
// Then, filter out any 'null' values, which represent segments that could not be parsed into valid numbers.
const numericResultSet = stringSegmentsCollection
    .map(convertToIntegerSafely)
    .filter(parsedItem => parsedItem !== null);

// The 'numericResultSet' now contains an array of successfully parsed integers.
// This array represents the final processed output of the script.