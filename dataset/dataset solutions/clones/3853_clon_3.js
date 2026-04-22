'use strict';

/**
 * A utility function to safely convert a string value into a finite number.
 * If the conversion fails or results in a non-finite number, a specified default value is returned.
 * @param {string} inputString - The string to be converted to a number.
 * @param {number} [fallbackValue=0] - The value to return if conversion is unsuccessful.
 * @returns {number} The parsed number or the fallback value.
 */
const convertToNumberOrDefault = (inputString, fallbackValue = 0) => {
    const parsedNumber = Number(inputString);
    // Use Number.isFinite to ensure the number is not Infinity, -Infinity, or NaN.
    return Number.isFinite(parsedNumber) ? parsedNumber : fallbackValue;
};

/**
 * Primary function responsible for analyzing a grid's connectivity.
 * It determines if every '#' character in the grid is adjacent (horizontally or vertically)
 * to at least one other '#' character.
 * @param {string} gridRawData - The complete string input containing grid dimensions and cell data.
 */
function processGridConnectivityCheck(gridRawData) {
    // Input validation: Ensure the raw data is a string.
    if (typeof gridRawData !== 'string' || gridRawData.trim().length === 0) {
        console.log('No'); // No valid input, thus no connectivity.
        return;
    }

    // Split the input into individual lines and filter out any empty ones.
    const contentLines = gridRawData.split('\n').filter(line => line.trim().length > 0);

    // Basic check: There must be at least one line for dimensions.
    if (contentLines.length < 1) {
        console.log('No');
        return;
    }

    // Extract dimensions from the first line.
    const dimensionElements = contentLines[0].split(' ');
    const totalRows = convertToNumberOrDefault(dimensionElements[0]); // Corresponds to H
    const totalCols = convertToNumberOrDefault(dimensionElements[1]); // Corresponds to W

    // Validate parsed dimensions. Grid must have positive dimensions.
    if (totalRows <= 0 || totalCols <= 0) {
        console.log('No');
        return;
    }

    // Construct the grid matrix from the subsequent lines.
    // `slice(1)` correctly gets all lines after the dimension line.
    const cellLayoutMatrix = contentLines.slice(1).map(lineSegment => lineSegment.split(''));

    // Validate the actual number of rows in the matrix.
    if (cellLayoutMatrix.length !== totalRows) {
        console.log('No'); // Mismatch in row count.
        return;
    }

    // Validate the actual number of columns for each row in the matrix.
    for (let rIdx = 0; rIdx < totalRows; ++rIdx) {
        if (cellLayoutMatrix[rIdx].length !== totalCols) {
            console.log('No'); // Mismatch in column count for a row.
            return;
        }
    }

    // Define relative movements for 4-directional adjacency (North, East, South, West).
    // Using an array of arrays for delta coordinates.
    const movementOffsets = [
        [-1, 0], // Move Up (decrement row)
        [0, 1],  // Move Right (increment column)
        [1, 0],  // Move Down (increment row)
        [0, -1]  // Move Left (decrement column)
    ];

    let isAnySharpIsolated = false; // Flag to indicate if any '#' cell lacks neighbors.

    // Iterate through every cell in the grid using two nested loops.
    // The outer loop handles rows, the inner loop handles columns.
    for (let currentR = 0; currentR < totalRows; ++currentR) {
        for (let currentC = 0; currentC < totalCols; ++currentC) {
            const currentCellSymbol = cellLayoutMatrix[currentR][currentC];

            // If the current cell is a '.', it cannot be isolated, so skip it.
            if (currentCellSymbol === '.') {
                continue; // Proceed to the next cell.
            }

            // If it's a '#' cell, we need to check its neighbors.
            let connectedSharpNeighbors = 0; // Counter for adjacent '#' cells.

            // Iterate over each defined movement direction.
            for (let dirIndex = 0; dirIndex < movementOffsets.length; ++dirIndex) {
                const [deltaR, deltaC] = movementOffsets[dirIndex]; // Unpack row and column changes.

                const neighborR = currentR + deltaR;
                const neighborC = currentC + deltaC;

                // Check if the potential neighbor cell is within the grid boundaries.
                const isNeighborRowValid = neighborR >= 0 && neighborR < totalRows;
                const isNeighborColValid = neighborC >= 0 && neighborC < totalCols;

                if (!isNeighborRowValid || !isNeighborColValid) {
                    continue; // Out-of-bounds neighbor, so it's not a valid connection.
                }

                // Get the symbol of the valid neighbor cell.
                const neighborSymbol = cellLayoutMatrix[neighborR][neighborC];

                // If the neighbor is also '#', increment the counter.
                if (neighborSymbol === '#') {
                    connectedSharpNeighbors++;
                }
            }

            // After checking all 4 neighbors, if a '#' cell has no adjacent '#' cells,
            // then we've found an isolated '#' and the answer is 'No'.
            if (connectedSharpNeighbors === 0) {
                isAnySharpIsolated = true;
                // Optimization: Once an isolated '#' is found, no further checks are needed.
                break; // Exit the inner (column) loop.
            }
        }
        // If an isolated '#' was found in the current row, exit the outer (row) loop as well.
        if (isAnySharpIsolated) {
            break;
        }
    }

    // Formulate the final output based on the flag.
    const finalOutcome = isAnySharpIsolated ? 'No' : 'Yes';

    // Display the result to standard output.
    console.log(finalOutcome);
}

// Main execution block: Reads input from /dev/stdin and calls the processing function.
// This block is wrapped in a try-catch to handle potential file system errors.
try {
    const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processGridConnectivityCheck(systemInputContent);
} catch (fileReadError) {
    // If there's an error reading the input (e.g., file not found, permissions),
    // log the error and output 'No' as a safe default.
    console.error('An error occurred during input processing:', fileReadError.message);
    console.log('No');
}