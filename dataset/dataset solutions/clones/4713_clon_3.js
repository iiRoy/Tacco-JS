process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInputBuffer = '';
let processedInputLines = [];
let currentLinePointer = 0;

// Helper function to fetch the next line from the processed input
const fetchNextInputLine = () => {
    if (currentLinePointer >= processedInputLines.length) {
        // This indicates an unexpected end of input or logic error
        console.error("Attempted to read past end of input lines.");
        return null; // Or throw an error
    }
    return processedInputLines[currentLinePointer++];
};

// Accumulate data as it comes in
process.stdin.on('data', (dataChunk) => {
    accumulatedInputBuffer += dataChunk;
});

// Once all input is received, process it and execute the main logic
process.stdin.on('end', () => {
    processedInputLines = accumulatedInputBuffer.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    
    const outcome = findPatternInGrid(); // Execute the core problem-solving logic
    
    // Output the final result
    if (outcome) {
        process.stdout.write('Yes\n');
    } else {
        process.stdout.write('No\n');
    }
    
    process.exit(0); // Ensure the process terminates gracefully
});

/**
 * Checks if a smaller pattern grid exists within a larger main grid
 * starting at a specific top-left corner.
 * @param {string[]} mainGrid The larger grid of characters.
 * @param {string[]} patternGrid The smaller pattern grid to find.
 * @param {number} startRow The starting row index in mainGrid.
 * @param {number} startCol The starting column index in mainGrid.
 * @param {number} patternSize The dimension (M) of the patternGrid.
 * @returns {boolean} True if the pattern matches at the given position, false otherwise.
 */
function verifySubgridMatch(mainGrid, patternGrid, startRow, startCol, patternSize) {
    for (let patternRowIndex = 0; patternRowIndex < patternSize; patternRowIndex++) {
        // Extract the corresponding slice from the main grid
        const mainGridSegment = mainGrid[startRow + patternRowIndex].slice(startCol, startCol + patternSize);
        
        // Compare directly with the pattern grid row
        if (mainGridSegment !== patternGrid[patternRowIndex]) {
            return false; // Mismatch found
        }
    }
    return true; // All rows matched
}

/**
 * Main function to solve the grid pattern problem.
 * Reads grid dimensions, then the grids, and searches for the pattern.
 * @returns {boolean} True if the pattern is found, false otherwise.
 */
function findPatternInGrid() {
    // Read the first line containing grid dimensions (N M)
    const dimensionInfo = fetchNextInputLine().split(/\s+/).map(Number);
    
    // Extract major grid size (N) and minor grid size (M)
    const majorGridDimension = dimensionInfo[0];
    const minorGridDimension = dimensionInfo[1];

    // Basic input validation and early exit conditions
    if (isNaN(majorGridDimension) || isNaN(minorGridDimension) || majorGridDimension < 1 || minorGridDimension < 1) {
        // Invalid dimensions provided
        return false;
    }
    if (minorGridDimension > majorGridDimension) {
        // The pattern grid is larger than the main grid, impossible to find
        return false;
    }

    // Read the main grid (A)
    const mainGridData = [];
    for (let row = 0; row < majorGridDimension; row++) {
        // Ensure line is trimmed and sliced to the correct length
        mainGridData.push(fetchNextInputLine().trim().slice(0, majorGridDimension));
    }

    // Read the pattern grid (B)
    const patternGridData = [];
    for (let row = 0; row < minorGridDimension; row++) {
        // Ensure line is trimmed and sliced to the correct length
        patternGridData.push(fetchNextInputLine().trim().slice(0, minorGridDimension));
    }

    // Iterate through all possible top-left starting positions for the pattern within the main grid
    // The pattern can only start at positions where it fully fits within the main grid
    const maxOffset = majorGridDimension - minorGridDimension;
    for (let currentMainRowOffset = 0; currentMainRowOffset <= maxOffset; currentMainRowOffset++) {
        for (let currentMainColOffset = 0; currentMainColOffset <= maxOffset; currentMainColOffset++) {
            // Check if the subgrid starting at (currentMainRowOffset, currentMainColOffset) matches the pattern
            if (verifySubgridMatch(mainGridData, patternGridData, currentMainRowOffset, currentMainColOffset, minorGridDimension)) {
                return true; // Pattern found!
            }
        }
    }
    
    return false; // Pattern not found after checking all possibilities
}