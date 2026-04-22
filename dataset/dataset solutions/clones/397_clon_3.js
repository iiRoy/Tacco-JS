// This module processes a sequence of binary matrices to find the longest continuous streak of '1's in four cardinal and diagonal directions.
// Each matrix is read from an input string, and the result for each matrix is printed.

/**
 * Determines the maximum length of a consecutive sequence of '1's starting from a given cell
 * in any of the four defined directions (horizontal, vertical, two diagonals).
 *
 * @param {number} startRow The starting row index for the streak search.
 * @param {number} startCol The starting column index for the streak search.
 * @param {number[][]} matrixData The 2D array representing the binary matrix.
 * @param {number} matrixDim The dimension (size N) of the square matrix.
 * @returns {number} The maximum length of a '1's streak found from the starting point.
 */
function findMaxConsecutive(startRow, startCol, matrixData, matrixDim) {
    // Define the directional vectors for movement:
    // {r: row_offset, c: col_offset}
    // 1. Horizontal (right)
    // 2. Diagonal (down-left)
    // 3. Vertical (down)
    // 4. Diagonal (down-right)
    const directionVectors = [
        { r: 0, c: 1 },
        { r: 1, c: -1 },
        { r: 1, c: 0 },
        { r: 1, c: 1 }
    ];

    let longestStreakFromPoint = 0; // Tracks the maximum streak found across all directions for this starting point.

    // Iterate through each possible direction.
    for (let k = 0; k < directionVectors.length; k++) {
        const { r: rowDelta, c: colDelta } = directionVectors[k]; // Destructure current direction offsets.
        let currentStreakLength = 0; // Resets for each new direction.

        // Extend the search in the current direction as long as possible within bounds.
        // The maximum possible streak length is the matrix dimension itself.
        for (let step = 0; step < matrixDim; step++) {
            const checkRow = startRow + (rowDelta * step);
            const checkCol = startCol + (colDelta * step);

            // Check if the current coordinates are within the matrix boundaries.
            if (checkRow < 0 || checkCol < 0 || checkRow >= matrixDim || checkCol >= matrixDim) {
                break; // Out of bounds, terminate this direction's search.
            }

            // Retrieve the value of the current cell.
            const cellValue = matrixData[checkRow][checkCol];

            // If the cell contains '1', increment the streak. Otherwise, the streak is broken.
            if (cellValue === 1) {
                currentStreakLength++;
            } else {
                break; // Streak broken, terminate this direction's search.
            }
        }
        // Update the overall longest streak found from this starting point.
        longestStreakFromPoint = Math.max(longestStreakFromPoint, currentStreakLength);

        // Optimization: If a streak equal to the matrix dimension is found, no longer streak is possible,
        // so we can exit early.
        if (longestStreakFromPoint === matrixDim) {
            return longestStreakFromPoint;
        }
    }

    return longestStreakFromPoint;
}

// Global variable to hold the parsed lines of input.
const rawInputData = (input.trim()).split("\n");

// Main processing loop for multiple test cases.
let linePointer = 0;
while (true) {
    // Read the dimension of the current square matrix.
    // Use Number() explicitly for robust conversion.
    const dimensionValue = Number(rawInputData[linePointer++]);

    // If the dimension is 0 or invalid (NaN), it signifies the end of input.
    if (isNaN(dimensionValue) || dimensionValue === 0) {
        break;
    }

    // Initialize an empty array to store the current matrix data.
    let currentMatrix = [];

    // Populate the matrix by reading 'dimensionValue' lines.
    for (let rowIndex = 0; rowIndex < dimensionValue; rowIndex++) {
        // Read the current row string and convert each character to an integer.
        const rowString = rawInputData[linePointer++];
        // Using parseInt(digit, 10) for explicit base conversion.
        currentMatrix.push(rowString.split("").map(digit => parseInt(digit, 10)));
    }

    // Variable to track the maximum consecutive '1's found across the entire matrix.
    let overallLongestSequence = 0;

    // Iterate through every cell in the matrix.
    for (let rowIndex = 0; rowIndex < dimensionValue; rowIndex++) {
        for (let colIndex = 0; colIndex < dimensionValue; colIndex++) {
            // Only start counting a streak if the current cell itself is a '1'.
            if (currentMatrix[rowIndex][colIndex] === 1) {
                // Calculate the max streak starting from this '1' and update the overall maximum.
                overallLongestSequence = Math.max(overallLongestSequence,
                                                  findMaxConsecutive(rowIndex, colIndex, currentMatrix, dimensionValue));

                // Early exit optimization: if the overall longest sequence is already equal to the matrix dimension,
                // no greater sequence can be found, so we can stop searching.
                if (overallLongestSequence === dimensionValue) {
                    break; // Exit inner loop
                }
            }
        }
        // If the overall longest sequence is already equal to the matrix dimension,
        // no greater sequence can be found, so we can stop searching.
        if (overallLongestSequence === dimensionValue) {
            break; // Exit outer loop
        }
    }

    // Output the result for the current test case.
    console.log(overallLongestSequence);
}