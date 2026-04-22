const processInputConfiguration = {
    sourcePath: '/dev/stdin',
    rowDelimiter: '\n'
};

const fileSystemModule = require('node:fs');

// Fetch all raw content from the configured source path
const rawDataString = fileSystemModule.readFileSync(processInputConfiguration.sourcePath, 'utf8');

// Divide the raw content into individual lines, discarding any empty lines
const parsedLines = rawDataString.split(processInputConfiguration.rowDelimiter).filter(Boolean);

// Extract and parse the dimensions of the primary data grid
const gridDimensionsInfo = parsedLines.shift().split(' ').map(Number);
const gridHeight = gridDimensionsInfo[0];
const gridWidth = gridDimensionsInfo[1];

// Isolate the lines that constitute the primary data grid
const mainGridContent = parsedLines.splice(0, gridHeight);

// Extract and parse the dimensions of the search pattern
const patternDimensionsInfo = parsedLines.shift().split(' ').map(Number);
const patternHeight = patternDimensionsInfo[0];
const patternWidth = patternDimensionsInfo[1];

// Isolate the lines that constitute the search pattern
const searchPatternContent = parsedLines.splice(0, patternHeight);

// If the pattern is larger than the main grid in any dimension, no match is possible
if (gridHeight < patternHeight || gridWidth < patternWidth) {
    process.exit(0); // Terminate the process successfully
}

// A utility function to determine if a specific sub-section of the main grid
// matches the provided pattern
const assessSectionMatch = (
    largerMatrix,
    smallerPattern,
    rowOffset,
    colOffset,
    patternRows,
    patternCols
) => {
    // Iterate through each row of the pattern
    for (let currentPatternLine = 0; currentPatternLine < patternRows; currentPatternLine++) {
        // Extract the corresponding horizontal segment from the larger matrix
        const matrixSegment = largerMatrix[rowOffset + currentPatternLine].substring(
            colOffset,
            colOffset + patternCols
        );

        // Compare this segment with the current pattern row
        if (matrixSegment !== smallerPattern[currentPatternLine]) {
            return false; // Mismatch found, this section does not match
        }
    }
    return true; // All pattern rows matched their corresponding segments
};

// Calculate the maximum possible starting row and column indices for a pattern
// to fit within the main grid
const maxValidRowStart = gridHeight - patternHeight;
const maxValidColStart = gridWidth - patternWidth;

// Generate an array of all possible starting row indices
const potentialRowIndices = Array.from({ length: maxValidRowStart + 1 }, (_, index) => index);

// Transform the potential row indices into an array of [row, col] coordinate pairs
// representing all possible top-left starting positions for the pattern
const allCandidatePositions = potentialRowIndices.flatMap(rCoord => {
    // For each row, generate an array of all possible starting column indices
    const potentialColIndices = Array.from({ length: maxValidColStart + 1 }, (_, index) => index);
    // Combine row and column indices into [r, c] pairs
    return potentialColIndices.map(cCoord => [rCoord, cCoord]);
});

// Filter the candidate positions to find only those where the pattern actually matches
const verifiedMatches = allCandidatePositions.filter(([currentR, currentC]) => {
    // Use the utility function to check for a match at the current position
    return assessSectionMatch(
        mainGridContent,
        searchPatternContent,
        currentR,
        currentC,
        patternHeight,
        patternWidth
    );
});

// Output the row and column coordinates for each confirmed match
verifiedMatches.forEach(([finalR, finalC]) => {
    console.log(finalR, finalC);
});