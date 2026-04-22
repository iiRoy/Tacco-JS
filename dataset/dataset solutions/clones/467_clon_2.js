// Function to rotate a square matrix 90 degrees clockwise
function spinMatrix ( inputArray ) {
    const lastIndex = inputArray.length - 1; // Calculate the last valid index for rows/columns
    // Create a new matrix by mapping and slicing each row to ensure a deep copy
    let rotatedMatrix = inputArray.map(
        function ( rowElement ) {
            return rowElement.slice(); // Deep copy each row array
        }
    );

    // Iterate through each cell of the matrix to perform the rotation transformation
    for ( let rowIndex = 0; rowIndex <= lastIndex; rowIndex++ ) {
        for ( let colIndex = 0; colIndex <= lastIndex; colIndex++ ) {
            // The element at new position [rowIndex][colIndex] comes from original [lastIndex - colIndex][rowIndex]
            rotatedMatrix[rowIndex][colIndex] = inputArray[lastIndex - colIndex][rowIndex];
        }
    }
    return rotatedMatrix; // Return the newly rotated matrix
}

// This routine checks for a pattern match at a given offset within the main grid
function verifyOverlap ( rowOffset, colOffset ) {
    let matchResult = false; // Initialize the result; 'false' means no match yet or no valid first coordinate
    // Iterate through the cells of the search pattern matrix
    for ( let patternRow = 0; patternRow < subMatrixDim; patternRow++ ) {
        for ( let patternCol = 0; patternCol < subMatrixDim; patternCol++ ) {
            // If the pattern element is a wildcard (-1), skip checking it
            if ( searchPattern[patternRow][patternCol] === -1 )
                continue;

            // If this is the first non-wildcard element encountered, record its absolute position in the main grid
            if ( matchResult === false )
                matchResult = [rowOffset + patternRow, colOffset + patternCol];

            // Compare the current pattern element with the corresponding element in the main grid
            // If they don't match, this is not a valid placement for the pattern
            if ( mainGrid[rowOffset + patternRow][colOffset + patternCol] !== searchPattern[patternRow][patternCol] )
                return false; // Mismatch found, so return 'false' immediately
        }
    }
    return matchResult; // If all non-wildcard elements matched, return the coordinates of the first match
}

// Read all input from standard input as a UTF-8 string
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into individual lines and store them in a buffer, removing any leading/trailing whitespace
let lineBuffer = rawData.trim().split('\n');

// Main loop to process multiple test cases from the input buffer
while ( true ) {
    // Extract grid dimensions (N and M) from the first line of the current test case
    const dimensions = lineBuffer.shift().split(' ').map(Number);
    let gridRows = dimensions[0]; // N: Represents the number of rows/columns in the main grid
    let subMatrixDim = dimensions[1]; // M: Represents the dimension of the square sub-matrix (pattern)

    // Termination condition for the entire program loop (N=0 and M=0 indicates end of input)
    if ( gridRows === 0 && subMatrixDim === 0 ) {
        break; // Exit the loop
    }

    // Initialize the main grid array (N x N)
    let mainGrid = [];
    // Populate the main grid by parsing subsequent input lines
    for ( let rowIdx = 0; rowIdx < gridRows; rowIdx++ ) {
        const currentLine = lineBuffer.shift().split(' ').map(Number); // Convert line to an array of numbers
        mainGrid.push(currentLine); // Add the parsed row to the main grid
    }

    // Initialize the search pattern matrix array (M x M)
    let searchPattern = [];
    // Populate the search pattern matrix from input lines
    for ( let rowIdx = 0; rowIdx < subMatrixDim; rowIdx++ ) {
        const currentLine = lineBuffer.shift().split(' ').map(Number); // Convert line to an array of numbers
        searchPattern.push(currentLine); // Add the parsed row to the search pattern
    }

    // Variable to store the best (top-leftmost) match position found across all rotations and offsets
    // Initialized to a value that is guaranteed to be larger than any valid match coordinates (1-indexed)
    let bestMatchPosition = [101, 101];

    // Iterate through 4 rotations of the search pattern (0, 90, 180, 270 degrees)
    for ( let rotationCount = 0; rotationCount < 4; rotationCount++ ) {
        // Iterate through all possible top-left corner positions for the sub-matrix within the main grid
        for ( let rowOffset = 0; rowOffset <= gridRows - subMatrixDim; rowOffset++ ) {
            for ( let colOffset = 0; colOffset <= gridRows - subMatrixDim; colOffset++ ) {
                // Check if the current search pattern (at its current rotation) matches at this specific offset
                const currentMatch = verifyOverlap(rowOffset, colOffset);

                // If a match is found (i.e., 'currentMatch' is not 'false')
                if ( currentMatch !== false ) {
                    // Update the 'bestMatchPosition' if the current match is better (i.e., smaller 1-indexed row,
                    // or same 1-indexed row with a smaller 1-indexed column).
                    // The problem asks for 1-indexed coordinates, so we add 1 to the 0-indexed values.
                    if ( bestMatchPosition[0] >= currentMatch[0] + 1 && bestMatchPosition[1] > currentMatch[1] + 1 ) {
                        bestMatchPosition = [currentMatch[0] + 1, currentMatch[1] + 1];
                    }
                }
            }
        }
        // Rotate the search pattern clockwise for the next iteration
        searchPattern = spinMatrix(searchPattern);
    }

    // Output the result:
    // If 'bestMatchPosition' is still its initial value, it means no match was found, so output "NA".
    // Otherwise, output the 1-indexed column and row of the best match, separated by a space.
    console.log( ( bestMatchPosition.join('') === '101101' ) ? 'NA' : `${bestMatchPosition[1]} ${bestMatchPosition[0]}` );
}