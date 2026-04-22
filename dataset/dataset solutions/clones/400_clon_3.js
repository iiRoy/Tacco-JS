function determineMaxRun(initialRow, initialCol, currentGrid, currentGridDimension) {
    // This function calculates the maximum length of a consecutive sequence of '1's
    // starting from (initialRow, initialCol) and extending in four predefined directions.
    // It is assumed that currentGrid[initialRow][initialCol] is '1' when this function is called,
    // as per the calling context.

    // Define movement offsets for row and column to check four directions:
    // [horizontal right, diagonal down-left, vertical down, diagonal down-right]
    const rowMovementOffsets = [0, 1, 1, 1];
    const colMovementOffsets = [1, -1, 0, 1];

    // Initialize the maximum length of a sequence found starting from this specific point.
    let longestSegmentFound = 0; 

    // Helper function to check if given coordinates (r, c) are within the grid boundaries.
    const isCoordinateValid = (r, c, dim) => r >= 0 && c >= 0 && r < dim && c < dim;

    // Iterate through each of the four defined directions.
    for (let directionIndex = 0; directionIndex < rowMovementOffsets.length; directionIndex++) {
        let segmentLength = 0; // Current sequence length for the specific direction being checked.
                               // This is reset for each new direction.

        // Loop to extend the search in the current direction.
        // `stepCount` starts at 0, meaning it first considers the `initialRow, initialCol` itself,
        // then 1 step away, 2 steps away, up to `currentGridDimension` steps away.
        // This allows checking up to `currentGridDimension + 1` cells (including the start),
        // which correctly covers sequences up to the grid's maximum possible length.
        for (let stepCount = 0; stepCount <= currentGridDimension; stepCount++) {
            const nextRow = initialRow + (rowMovementOffsets[directionIndex] * stepCount);
            const nextCol = initialCol + (colMovementOffsets[directionIndex] * stepCount);

            // First, check if the calculated next coordinates are within the grid boundaries.
            if (!isCoordinateValid(nextRow, nextCol, currentGridDimension)) {
                break; // If out of bounds, no further extension is possible in this direction.
            }

            // Second, check if the cell at the current coordinates contains the value '1'.
            if (currentGrid[nextRow][nextCol] !== 1) {
                break; // If a non-'1' value is encountered, the sequence of '1's ends here.
            }

            // If the cell is within bounds and contains '1', increment the current segment length.
            segmentLength++;
        }

        // After checking one direction, update the overall maximum sequence length found
        // from the `initialRow, initialCol` starting point if the current direction's
        // segment length is greater.
        if (segmentLength > longestSegmentFound) {
            longestSegmentFound = segmentLength;
        }
    }

    // Return the longest sequence of '1's found starting from the given coordinates.
    return longestSegmentFound;
}

// Import Node.js File System module for reading input.
const fileSystem = require('fs');

// Helper function to encapsulate the processing logic for a single grid test case.
function processGridTestCase(gridSideLength, binaryGridData) {
    // Initialize the overall maximum sequence length for the current grid, across all possible starting points.
    let overallMaxSequenceLength = 0;

    // Iterate through every cell in the grid using nested loops.
    for (let rowIndex = 0; rowIndex < gridSideLength; rowIndex++) {
        for (let colIndex = 0; colIndex < gridSideLength; colIndex++) {
            // If the current cell contains a '1', it's a potential starting point for a sequence.
            if (binaryGridData[rowIndex][colIndex] === 1) {
                // Calculate the maximum run of '1's starting from this cell.
                const currentCellMaxRun = determineMaxRun(rowIndex, colIndex, binaryGridData, gridSideLength);
                
                // Update the overall maximum if a longer sequence is found.
                if (currentCellMaxRun > overallMaxSequenceLength) {
                    overallMaxSequenceLength = currentCellMaxRun;
                }
            }
        }
    }
    // Output the final result (the maximum sequence length) for the current test case.
    console.log(overallMaxSequenceLength);
}

// Main program entry point and error handling.
try {
    // Read all input from standard input synchronously, decoding it as UTF-8.
    const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    
    // Trim any leading/trailing whitespace from the raw input and split it into an array of lines.
    let processedInputLines = rawInputContent.trim().split('\n');

    // Use an index to keep track of the current line being processed from the input array.
    let currentLineIndex = 0;

    // Loop through test cases. Each test case begins with a grid dimension 'n'.
    // The loop continues until a grid dimension of 0 is encountered, indicating end of input.
    while (true) {
        // Attempt to parse the grid dimension (N) for the current test case from the input lines.
        // `parseInt` with radix 10 ensures proper integer conversion.
        const gridSideLength = parseInt(processedInputLines[currentLineIndex++], 10);

        // Check for the termination condition: if N is 0, exit the processing loop.
        if (gridSideLength === 0) {
            break;
        }

        // Basic input validation: ensure the grid dimension is a valid positive number.
        if (isNaN(gridSideLength) || gridSideLength < 1) {
            console.error(`Error: Invalid or non-positive grid dimension encountered: ${gridSideLength}. Skipping remaining input.`);
            // In a real-world scenario, one might try to recover or skip only the current invalid case.
            // For simplicity, we'll break entirely.
            break;
        }

        // Initialize a 2D array (matrix) to store the binary grid data for the current test case.
        const binaryGridData = [];

        // Populate the grid by parsing subsequent lines based on the `gridSideLength`.
        for (let rowIdx = 0; rowIdx < gridSideLength; rowIdx++) {
            const rowString = processedInputLines[currentLineIndex++];
            
            // Check if the input ended prematurely before all expected rows were read.
            if (!rowString) {
                console.error(`Error: Expected ${gridSideLength} rows but input ended prematurely at row ${rowIdx}.`);
                throw new Error("Premature end of input for grid data.");
            }
            
            // Convert each character in the row string to a number (0 or 1) and push it to the grid.
            // `Array.from` is used here as an alternative to `split('').map(Number)`.
            binaryGridData.push(Array.from(rowString, char => parseInt(char, 10)));
        }

        // Once the grid data is prepared, process the current test case.
        processGridTestCase(gridSideLength, binaryGridData);
    }
} catch (error) {
    // Catch and log any errors that occur during file reading, parsing, or processing.
    console.error("An error occurred during program execution:", error.message);
    // Exit the process with a non-zero status code to indicate that an error occurred.
    process.exit(1);
}