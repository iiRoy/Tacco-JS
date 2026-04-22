// This module handles file system operations for input data.
const fileSystemHandler = require('fs');

// Configuration object for application parameters.
// This allows for dynamic adjustments based on the execution environment.
const processingOptions = {
    // Determines the operating system to set appropriate file paths and line endings.
    systemPlatform: process.platform,
    // Default input path for Unix-like systems (e.g., Linux, macOS).
    defaultInputPath: '/dev/stdin',
    // Alternative input path for Windows systems.
    windowsInputPath: 'tmp',
    // Standard newline character for Unix-like systems.
    unixLineSeparator: '\n',
    // Standard newline character for Windows systems.
    windowsLineSeparator: '\r\n',
    // Encoding to use when reading the input file. 'utf8' is a common and versatile choice.
    fileDataEncoding: 'utf8'
};

// Dynamically determine the input file path and line separator based on the detected OS.
let currentInputFileLocation;
let activeLineEnding;

if (processingOptions.systemPlatform === 'win32') {
    currentInputFileLocation = processingOptions.windowsInputPath;
    activeLineEnding = processingOptions.windowsLineSeparator;
} else {
    currentInputFileLocation = processingOptions.defaultInputPath;
    activeLineEnding = processingOptions.unixLineSeparator;
}

/**
 * Reads content from a specified file, splits it into lines, and returns a limited number of lines.
 * Includes basic error handling and validation for the number of lines.
 * @param {string} filePath - The path to the file to be read.
 * @param {string} lineSeparator - The character(s) used to separate lines in the file.
 * @param {string} encoding - The character encoding of the file content.
 * @returns {string[]} An array containing the first two processed lines from the file.
 */
function acquireAndProcessInputLines(filePath, lineSeparator, encoding) {
    let rawFileContents;
    try {
        // Synchronously read the entire file content.
        rawFileContents = fileSystemHandler.readFileSync(filePath, encoding);
    } catch (readOperationError) {
        // Log an error and terminate if file reading fails.
        console.error(`ERROR: Could not access or read the input file at '${filePath}'. Details: ${readOperationError.message}`);
        process.exit(1); // Exit with a non-zero status code indicating an error.
    }

    // Convert the buffer to a string and split into an array of lines.
    // We only need the first two lines, so '2' is used as a limit.
    const splitInputLines = rawFileContents.toString().split(lineSeparator, 2);

    // Validate that we received the expected number of lines.
    const minimumRequiredLines = 2;
    if (splitInputLines.length < minimumRequiredLines) {
        console.error(`ERROR: Input file '${filePath}' did not contain enough lines. Expected at least ${minimumRequiredLines}, but found ${splitInputLines.length}.`);
        process.exit(1);
    }

    // Return the processed lines, trimming any extraneous whitespace from each.
    return splitInputLines.map(line => line.trim());
}

// Execute the input acquisition process.
const rawInputContentArray = acquireAndProcessInputLines(
    currentInputFileLocation,
    activeLineEnding,
    processingOptions.fileDataEncoding
);

// Assign the main text and the pattern to search for, using descriptive constant names.
const sourceText = rawInputContentArray[0];
const patternToFind = rawInputContentArray[1];

// Initialize variables for the search operation.
let currentSearchOffset = 0; // The starting index for the next search attempt.
const matchingPositions = new Array(); // An array to store all found starting indices.
let totalMatchesFound = 0; // A counter for the number of occurrences.

// Loop to find all non-overlapping occurrences of the pattern within the source text.
// The search continues as long as the pattern is found.
let nextMatchIndex; // Temporary variable to hold the result of indexOf.
while ((nextMatchIndex = sourceText.indexOf(patternToFind, currentSearchOffset)) !== -1) {
    // If a match is found, add its starting index to our results list.
    matchingPositions.push(nextMatchIndex);
    // Move the search offset past the current match to find the next one.
    currentSearchOffset = nextMatchIndex + 1;
    // Increment the total count of matches.
    totalMatchesFound++;
}

// Output the results.
// If any matches were found, print each index on a new line.
if (totalMatchesFound > 0) {
    // Using process.stdout.write for direct output, appending a final newline for consistency.
    process.stdout.write(matchingPositions.join(processingOptions.unixLineSeparator) + processingOptions.unixLineSeparator);
} else {
    // If no matches were found, print a descriptive message.
    process.stdout.write("No instances of the specified pattern were located within the source text.\n");
}

// Script execution successfully completed.