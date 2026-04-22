const applicationSettings = {
    sourceFilePath: '/dev/stdin', // Path to the input data file, typically standard input on Linux.
    lineSeparationCharacter: '\n' // Character used to delineate lines within the input.
};

/**
 * Finds all non-overlapping starting indices of a given substring within a main string.
 * This function mimics the behavior of repeatedly calling String.prototype.indexOf.
 *
 * @param {string} mainStr The string in which to search.
 * @param {string} subStr The substring to search for.
 * @returns {number[]} An array containing all starting indices where the substring was found.
 */
function locateAllSubstrings(mainStr, subStr) {
    const foundPositions = []; // Stores the indices of all matches.
    let currentScanPosition = 0; // The index from which to start the next search.

    // Loop until no more occurrences of the substring are found.
    while (true) {
        // Find the next occurrence of the substring starting from currentScanPosition.
        const nextMatchIndex = mainStr.indexOf(subStr, currentScanPosition);

        // If indexOf returns -1, no more matches were found, so exit the loop.
        if (nextMatchIndex === -1) {
            break;
        }

        // Add the found index to our collection.
        foundPositions.push(nextMatchIndex);

        // Crucially, advance the search position to ensure we find subsequent matches.
        // We increment by 1 to find occurrences that might start immediately after the current one,
        // including handling empty string patterns correctly (where indexOf returns currentScanPosition).
        currentScanPosition = nextMatchIndex + 1;
    }

    return foundPositions;
}

// Obtain the file system module from Node.js for input operations.
const fileSystemUtility = require('fs');

let rawInputContent;
try {
    // Read the entire content of the specified input file synchronously.
    // Using 'utf8' encoding for broader character support compared to 'ascii'.
    rawInputContent = fileSystemUtility.readFileSync(applicationSettings.sourceFilePath, { encoding: 'utf8' });
} catch (fileReadError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error(`Failed to retrieve input from '${applicationSettings.sourceFilePath}'. Error details: ${fileReadError.message}`);
    process.exit(1); // Exit with a non-zero status code indicating an error.
}

// Split the raw content into an array of lines based on the defined separator.
const parsedInputLines = rawInputContent.split(applicationSettings.lineSeparationCharacter);

// A critical check: ensure that at least two lines of input were provided.
// The first line is the primary text, the second is the pattern.
if (parsedInputLines.length < 2) {
    console.error("Input format invalid: Expected a minimum of two lines (main text, then pattern).");
    process.exit(1); // Terminate due to insufficient input.
}

// Assign the first line as the main text to be searched.
const primaryTextString = parsedInputLines[0];
// Assign the second line as the pattern to locate.
const targetSearchPattern = parsedInputLines[1];

// Execute the pattern search operation.
const allMatchingIndices = locateAllSubstrings(primaryTextString, targetSearchPattern);

// Display the results: print each found index on a new line.
// Only print if at least one match was found, consistent with original behavior.
if (allMatchingIndices.length > 0) {
    // Iterate through the array of indices and log each one.
    for (let i = 0; i < allMatchingIndices.length; i++) {
        console.log(allMatchingIndices[i]);
    }
}

// If no matches are found, the program will simply exit without producing any output.