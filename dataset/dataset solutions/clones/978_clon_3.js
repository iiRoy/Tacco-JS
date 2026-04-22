// Expert-generated Type III clone.
// This script identifies occurrences of a given rectangular character pattern
// within a larger character grid, outputting the top-left coordinates of each match.
// Significant structural and naming variations have been applied.

// Configuration setup for input/output handling.
// The primary source for grid and pattern data.
const ioConfiguration = {
    sourcePath: '/dev/stdin', // Default for Linux environments
    lineParsingDelimiter: '\n' // Standard Unix-style newline
};

// For Windows, uncomment the following block to override defaults.
/*
ioConfiguration.sourcePath = 'input.txt'; // Example file path
ioConfiguration.lineParsingDelimiter = '\r\n'; // Windows-style newline
*/

// Function to safely parse a string into an array of numbers.
// Handles potential non-numeric input gracefully.
const extractNumericDimensions = (dimensionString) => {
    const parts = dimensionString.split(' ').map(Number);
    if (parts.some(isNaN) || parts.length < 2) {
        console.error("Error: Invalid dimension string provided. Expected two numbers.");
        process.exit(1); // Exit with an error code
    }
    return parts;
};

// Retrieve raw input data from the configured source.
let rawInputPayload;
try {
    rawInputPayload = require('fs').readFileSync(ioConfiguration.sourcePath, 'ascii');
} catch (readError) {
    console.error(`Failed to read input from ${ioConfiguration.sourcePath}:`, readError.message);
    process.exit(1);
}

// Split the entire payload into individual lines based on the delimiter.
const processedInputLines = rawInputPayload.split(ioConfiguration.lineParsingDelimiter);

// Parse the dimensions of the main grid.
const [mainGridHeight, mainGridWidth] = extractNumericDimensions(processedInputLines[0]);

// Extract the main grid data (rows as strings).
const mainGridContent = processedInputLines.slice(1, 1 + mainGridHeight);

// Validate main grid content length.
if (mainGridContent.length !== mainGridHeight) {
    console.error("Error: Mismatch between declared grid height and actual content length.");
    process.exit(1);
}

// Parse the dimensions of the search pattern.
const [patternHeight, patternWidth] = extractNumericDimensions(processedInputLines[1 + mainGridHeight]);

// Extract the search pattern data.
const searchPatternContent = processedInputLines.slice(1 + mainGridHeight + 1, 1 + mainGridHeight + 1 + patternHeight);

// Validate search pattern content length.
if (searchPatternContent.length !== patternHeight) {
    console.error("Error: Mismatch between declared pattern height and actual content length.");
    process.exit(1);
}

// --- Pre-computation and Early Exit Conditions ---

// If the pattern is larger than the main grid, no match is possible.
if (mainGridHeight < patternHeight || mainGridWidth < patternWidth) {
    // Optionally, a message could be logged here for debugging.
    // console.log("Pattern dimensions exceed grid dimensions. No matches possible.");
    process.exit(0); // Exit gracefully as no matches can be found.
}

// Prepare the main grid for efficient sub-segment extraction.
// This creates an array where each element corresponds to a row in the main grid.
// Each row element is itself an array of all possible contiguous sub-strings
// of length `patternWidth` from that row.
const gridRowSubsegments = mainGridContent.map(
    (currentGridRowString) => {
        const rowSegments = [];
        // Iterate to generate all possible horizontal slices of the pattern's width.
        for (let segmentStartingCol = 0; segmentStartingCol <= mainGridWidth - patternWidth; segmentStartingCol++) {
            rowSegments.push(currentGridRowString.substring(segmentStartingCol, segmentStartingCol + patternWidth));
        }
        return rowSegments;
    }
);

// --- Core Pattern Matching Logic ---

/**
 * Checks if the search pattern matches a sub-region of the main grid
 * starting at the given top-left coordinates.
 * @param {number} startRow The starting row index in the main grid.
 * @param {number} startCol The starting column index in the main grid.
 * @param {Array<Array<string>>} precomputedSegments Pre-computed horizontal segments of the main grid.
 * @param {Array<string>} patternRows The pattern rows to match against.
 * @returns {boolean} True if a match is found, false otherwise.
 */
const verifyPatternMatch = (startRow, startCol, precomputedSegments, patternRows) => {
    // Iterate through each row of the pattern.
    for (let currentPatternRowIndex = 0; currentPatternRowIndex < patternRows.length; currentPatternRowIndex++) {
        // Compare the corresponding pre-computed segment from the main grid
        // with the current row of the search pattern.
        // precomputedSegments[startRow + currentPatternRowIndex][startCol]
        // gives the `patternWidth`-length string from the main grid,
        // starting at (startRow + currentPatternRowIndex, startCol).
        if (precomputedSegments[startRow + currentPatternRowIndex][startCol] !== patternRows[currentPatternRowIndex]) {
            return false; // Mismatch found, no need to check further rows for this position.
        }
    }
    return true; // All pattern rows matched successfully.
};

// Iterate through all possible top-left starting positions in the main grid
// where the pattern could potentially fit.
let totalMatchesFound = 0; // New fragment: counter for matches.

for (let currentGridRowOffset = 0; currentGridRowOffset <= mainGridHeight - patternHeight; currentGridRowOffset++) {
    for (let currentGridColOffset = 0; currentGridColOffset <= mainGridWidth - patternWidth; currentGridColOffset++) {
        // Check if the pattern matches at the current offset.
        if (verifyPatternMatch(currentGridRowOffset, currentGridColOffset, gridRowSubsegments, searchPatternContent)) {
            // If a match is found, print its top-left coordinates.
            console.log(currentGridRowOffset, currentGridColOffset);
            totalMatchesFound++; // Increment the counter.
        }
    }
}

// Optional: Report total matches found at the end.
// if (totalMatchesFound === 0) {
//     console.log("No occurrences of the pattern were found in the grid.");
// } else {
//     console.log(`Found ${totalMatchesFound} occurrences.`);
// }