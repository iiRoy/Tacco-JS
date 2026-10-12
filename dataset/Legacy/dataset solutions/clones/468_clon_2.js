// Function to rotate a 2D array (matrix) 90 degrees clockwise
function spinMatrix(inputGrid) {
    // Determine the last valid index for rows/columns in the square grid
    const lastIdx = inputGrid.length - 1;
    // Create a new grid of the same dimensions, ensuring deep copies of rows
    // This prevents modification of the original array during the rotation process
    const rotatedGrid = inputGrid.map(row => row.slice());

    // Iterate through each cell of the original grid to populate the new rotated grid
    for (let rowIdx = 0; rowIdx <= lastIdx; rowIdx++) {
        for (let colIdx = 0; colIdx <= lastIdx; colIdx++) {
            // The element at (rowIdx, colIdx) in the new grid
            // corresponds to the element at (lastIdx - colIdx, rowIdx) in the original grid
            rotatedGrid[rowIdx][colIdx] = inputGrid[lastIdx - colIdx][rowIdx];
        }
    }
    // Return the newly created and rotated grid
    return rotatedGrid;
}

// Global variables to hold the dimensions and content of the main and pattern matrices.
// These are declared at the top level to be accessible by the `verifyMatch` function
// and updated within the main processing loop.
let patternDim;      // Stores the dimension (M) of the pattern matrix
let mainMatrix;      // Stores the N x N main matrix
let patternMatrix;   // Stores the M x M pattern matrix

// Function to determine if a given pattern matrix matches a sub-section of the main matrix.
// The sub-section starts at the specified (startRow, startCol) coordinates in the main matrix.
function verifyMatch(startRow, startCol) {
    // This variable will store the 0-indexed coordinates [row, col] of the first
    // non-wildcard element of the pattern if a match is found. It's initialized to false.
    let matchResult = false;

    // Iterate through the rows of the pattern matrix
    for (let patRow = 0; patRow < patternDim; patRow++) {
        // Iterate through the columns of the pattern matrix
        for (let patCol = 0; patCol < patternDim; patCol++) {
            // If the current element in the pattern matrix is a wildcard (-1),
            // it matches any value in the main matrix, so we skip comparison.
            if (patternMatrix[patRow][patCol] === -1) {
                continue;
            }

            // If this is the first non-wildcard element encountered during a potential match,
            // record its absolute position within the main matrix.
            if (matchResult === false) {
                matchResult = [startRow + patRow, startCol + patCol];
            }

            // Compare the element in the main matrix with the corresponding pattern element.
            // If they do not match, then the pattern does not fit at this starting position.
            if (mainMatrix[startRow + patRow][startCol + patCol] !== patternMatrix[patRow][patCol]) {
                return false; // A mismatch was found, so immediately return false.
            }
        }
    }
    // If the loops complete without finding any mismatches, a full match was found.
    // Return the coordinates of the first matched non-wildcard element.
    return matchResult;
}

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
const lineSegments = rawData.trim().split("\n");

// Main program loop: processes multiple test cases until a termination condition is met.
while (true) {
    // Extract the dimensions (N and M) for the current test case from the first line.
    // `shift()` removes the line from `lineSegments` after processing.
    const dimensions = lineSegments.shift().split(" ").map(Number);
    const mainDim = dimensions[0];      // N: Dimension of the main matrix
    patternDim = dimensions[1];         // M: Dimension of the pattern matrix (updates global variable)

    // Check for the termination condition: N=0 and M=0.
    if (mainDim === 0 && patternDim === 0) {
        break; // Exit the loop if both dimensions are zero.
    }

    // Initialize and populate the main matrix (N x N).
    mainMatrix = []; // Reset global mainMatrix for the new test case.
    for (let rowIdx = 0; rowIdx < mainDim; rowIdx++) {
        // Parse each line into an array of numbers and add it as a row to mainMatrix.
        const currentLineValues = lineSegments.shift().split(" ").map(Number);
        mainMatrix.push(currentLineValues);
    }

    // Initialize and populate the pattern matrix (M x M).
    patternMatrix = []; // Reset global patternMatrix for the new test case.
    for (let rowIdx = 0; rowIdx < patternDim; rowIdx++) {
        // Parse each line into an array of numbers and add it as a row to patternMatrix.
        const currentLineValues = lineSegments.shift().split(" ").map(Number);
        patternMatrix.push(currentLineValues);
    }

    // Initialize `minimumCoords` to a value that will be easily overwritten by any valid match.
    // This array stores 1-indexed coordinates [row, col].
    let minimumCoords = [101, 101]; // Max possible N is 100, so 101 is a safe initial value.

    // Loop through 4 rotations of the pattern matrix (0, 90, 180, 270 degrees).
    for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
        // Iterate through all possible top-left starting positions for the pattern
        // within the main matrix.
        for (let startRow = 0; startRow <= mainDim - patternDim; startRow++) {
            for (let startCol = 0; startCol <= mainDim - patternDim; startCol++) {
                // Call `verifyMatch` to check if the current pattern (in its current rotation)
                // matches a sub-section of the main matrix starting at (startRow, startCol).
                const matchFound = verifyMatch(startRow, startCol);

                // If a match is found (i.e., `matchFound` is not false)
                if (matchFound !== false) {
                    // Convert the 0-indexed `matchFound` coordinates to 1-indexed for comparison.
                    const currentMatchRow = matchFound[0] + 1;
                    const currentMatchCol = matchFound[1] + 1;

                    // Update `minimumCoords` if the current match represents a "smaller" position.
                    // Priority is given to a smaller row index, then a smaller column index.
                    if (minimumCoords[0] > currentMatchRow) {
                        minimumCoords = [currentMatchRow, currentMatchCol];
                    } else if (minimumCoords[0] === currentMatchRow && minimumCoords[1] > currentMatchCol) {
                        minimumCoords = [currentMatchRow, currentMatchCol];
                    }
                }
            }
        }
        // After checking all possible positions for the current rotation,
        // rotate the pattern matrix 90 degrees clockwise for the next iteration.
        patternMatrix = spinMatrix(patternMatrix);
    }

    // Output the final result for the current test case.
    // If `minimumCoords` is still [101, 101], it means no match was found across all rotations.
    // Otherwise, output the 1-indexed column and then row, separated by a space.
    console.log((minimumCoords.join("") === "101101") ? "NA" : minimumCoords[1] + " " + minimumCoords[0]);
}
