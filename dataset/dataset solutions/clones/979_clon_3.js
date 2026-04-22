const ioParameters = {
    inputStreamPath: '/dev/stdin', // Specifies the input source as standard input for Linux.
    lineDelimiter: '\n'           // Defines the character sequence used to separate lines in the input.
};

// Access the Node.js file system module for reading input.
const fileProcessor = require('fs');

/**
 * Parses a string containing space-separated numbers into an array of integers.
 * Includes basic validation to ensure the input is a valid string.
 * @param {string} rawStringData - The string to be parsed.
 * @returns {number[]} An array of numbers extracted from the string.
 */
const extractNumericalValues = (rawStringData) => {
    if (typeof rawStringData !== 'string' || rawStringData.trim() === '') {
        console.error("Error: Attempted to parse an invalid or empty string for numerical values.");
        return []; // Return an empty array for invalid input.
    }
    // Splits the string by spaces, filters out any empty strings that might result from multiple spaces,
    // and then converts each resulting substring into a number.
    return rawStringData.split(' ').filter(segment => segment !== '').map(Number);
};

// Read the entire content from the specified input stream, interpret it as ASCII,
// and then divide it into an array of strings based on the defined line delimiter.
const rawInputLines = fileProcessor.readFileSync(ioParameters.inputStreamPath, 'ascii')
    .split(ioParameters.lineDelimiter);

// --- Parse Main Grid Dimensions ---
// The first line of input provides the overall dimensions of the primary data grid.
const mainGridSize = extractNumericalValues(rawInputLines[0]);
const primaryGridHeight = mainGridSize[0]; // The number of rows in the main grid.
const primaryGridWidth = mainGridSize[1];  // The number of columns/character length of rows in the main grid.

// Perform essential validation checks for the main grid dimensions.
if (!Number.isInteger(primaryGridHeight) || primaryGridHeight <= 0 ||
    !Number.isInteger(primaryGridWidth) || primaryGridWidth <= 0) {
    console.error("Input Error: Main grid dimensions must be positive integers.");
    process.exit(1); // Terminate with an error code.
}

// Extract the actual data for the main grid.
// This data spans from the second line (index 1) up to 'primaryGridHeight' lines thereafter.
const mainDataMatrix = rawInputLines.slice(1, 1 + primaryGridHeight);

// --- Parse Pattern Dimensions ---
// The line immediately following the main grid data specifies the dimensions of the search pattern.
const searchPatternSize = extractNumericalValues(rawInputLines[1 + primaryGridHeight]);
const patternRowsCount = searchPatternSize[0]; // The number of rows in the pattern.
const patternColsCount = searchPatternSize[1]; // The character length of rows in the pattern.

// Perform essential validation checks for the pattern dimensions.
if (!Number.isInteger(patternRowsCount) || patternRowsCount <= 0 ||
    !Number.isInteger(patternColsCount) || patternColsCount <= 0) {
    console.error("Input Error: Search pattern dimensions must be positive integers.");
    process.exit(1);
}
// Additionally, verify that the pattern can actually fit within the main grid.
if (patternRowsCount > primaryGridHeight || patternColsCount > primaryGridWidth) {
    console.error("Input Error: Search pattern dimensions exceed the main grid dimensions. Cannot perform search.");
    process.exit(1);
}

// Extract the actual data for the search pattern.
// This data starts after the pattern dimension line and consists of 'patternRowsCount' lines.
const patternDataLines = rawInputLines.slice(1 + primaryGridHeight + 1, 1 + primaryGridHeight + 1 + patternRowsCount);

// --- Pre-computation Phase: Constructing a Match Lookup Table ---
// This 3D array (often called a memoization table or cache) stores pre-calculated results
// indicating if a specific row of the pattern is found within a row of the main grid,
// starting at a particular column index.
// Structure: `horizontalMatchCache[gridRowIndex][patternRowIndex][gridColumnStartIndex]`
// `true` means `patternDataLines[patternRowIndex]` is found in `mainDataMatrix[gridRowIndex]`
// beginning at `gridColumnStartIndex`.
const horizontalMatchCache = Array.from({ length: primaryGridHeight }, (_, currentGridRowIndex) => {
    return Array.from({ length: patternRowsCount }, (_, currentPatternRowIndex) => {
        // Calculate the maximum possible starting column for a horizontal match.
        // If a pattern row is 5 chars long and grid row is 10, max start col is 5 (0-indexed).
        const maximumColumnOffset = primaryGridWidth - patternColsCount;

        // Initialize a boolean array for this specific (gridRow, patternRow) pair.
        // Each entry corresponds to a potential starting column in the grid row.
        const columnMatchFlags = new Array(maximumColumnOffset + 1).fill(false);

        // Get the relevant string data for the current grid row and pattern row.
        const gridLineSegment = mainDataMatrix[currentGridRowIndex];
        const patternLineSegment = patternDataLines[currentPatternRowIndex];

        // Search for all occurrences of the pattern line segment within the grid line segment.
        let searchPosition = gridLineSegment.indexOf(patternLineSegment);
        while (searchPosition !== -1) {
            // If an occurrence is found, mark the corresponding cache entry as true.
            columnMatchFlags[searchPosition] = true;
            // Continue searching from the next character to find subsequent (possibly overlapping) matches.
            searchPosition = gridLineSegment.indexOf(patternLineSegment, searchPosition + 1);
        }
        return columnMatchFlags;
    });
});

// --- Main Search Execution: Locating the Full Pattern ---
// This section systematically checks every possible top-left corner position
// where the entire 'patternDataLines' could fit within the 'mainDataMatrix'.
const detectedOccurrences = []; // An array to store the coordinates of all found patterns.

// Iterate through all possible starting row indices for the pattern within the main grid.
// The pattern's top row can start from row 0 up to (primaryGridHeight - patternRowsCount).
for (let potentialStartRow = 0; potentialStartRow <= primaryGridHeight - patternRowsCount; ++potentialStartRow) {
    // Iterate through all possible starting column indices for the pattern within the main grid.
    // The pattern's left-most column can start from column 0 up to (primaryGridWidth - patternColsCount).
    for (let potentialStartColumn = 0; potentialStartColumn <= primaryGridWidth - patternColsCount; ++potentialStartColumn) {
        // Assume that the pattern matches at the current (potentialStartRow, potentialStartColumn)
        // until proven otherwise.
        let isFullPatternMatch = true;

        // Check each individual row of the pattern against the corresponding section of the main grid.
        // This check utilizes the pre-computed 'horizontalMatchCache' for efficiency.
        for (let internalPatternRowIndex = 0; internalPatternRowIndex < patternRowsCount; ++internalPatternRowIndex) {
            // Calculate the actual row index in the main grid that corresponds to the current pattern row.
            const actualGridRow = potentialStartRow + internalPatternRowIndex;

            // Consult the cache: if the current pattern row (internalPatternRowIndex) does NOT
            // horizontally match in 'actualGridRow' starting at 'potentialStartColumn',
            // then the entire pattern cannot match at this overall starting position.
            if (!horizontalMatchCache[actualGridRow][internalPatternRowIndex][potentialStartColumn]) {
                isFullPatternMatch = false; // Mark this overall position as a non-match.
                break; // No need to check further pattern rows for this position; move to the next.
            }
        }

        // If, after checking all rows of the pattern, 'isFullPatternMatch' remains true,
        // it signifies that the complete pattern has been successfully located at this position.
        if (isFullPatternMatch) {
            // Record the top-left coordinates of the found pattern.
            detectedOccurrences.push(`${potentialStartRow} ${potentialStartColumn}`);
        }
    }
}

// --- Output Results ---
// Print each detected occurrence's coordinates on a new line.
// If no patterns were found, this loop will simply not execute, resulting in no output.
detectedOccurrences.forEach(coordinates => console.log(coordinates));