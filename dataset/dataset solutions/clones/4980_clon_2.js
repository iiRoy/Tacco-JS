process.stdin.resume();
process.stdin.setEncoding('ascii');

// Buffer to accumulate all incoming standard input data
let rawInputData = "";
// Array to hold individual lines of input after splitting
let inputLinesArray = [];
// Pointer to the current line being processed from inputLinesArray
let currentLineIndex = 0;

// Event listener for 'data' chunks received from standard input
process.stdin.on('data', function (incomingChunk) {
    rawInputData += incomingChunk; // Append the new data chunk to the buffer
});

// Event listener for the 'SIGINT' signal (e.g., Ctrl+C)
process.on('SIGINT', function(){
    // When SIGINT is received, split the accumulated data into lines
    inputLinesArray = rawInputData.split("\n");
    // Execute the primary logic function
    processGridData();
    // Terminate the Node.js process
    process.exit();
});

// Event listener for the 'end' of the standard input stream
process.stdin.on('end', function () {
    // Once all input has been received, split it into lines
    inputLinesArray = rawInputData.split("\n");
    // Execute the primary logic function
    processGridData();
});

// Helper function to retrieve the next line from the pre-processed input array
function fetchNextLine() {
    return inputLinesArray[currentLineIndex++]; // Return the current line and then increment the index
}

/////////////// ignore above this line ////////////////////

// Main function containing the core algorithm for grid processing
function processGridData() {
    // An object to store the frequency of each 3x3 subgrid being "hit"
    const coordinateCounts = {};

    // Read the first line which contains the grid dimensions (Height, Width) and number of points (N)
    const lineParts = fetchNextLine().split(" ");
    const gridHeight = parseInt(lineParts[0], 10); // Parse grid height
    const gridWidth = parseInt(lineParts[1], 10);  // Parse grid width
    const numPoints = parseInt(lineParts[2], 10);  // Parse total number of points

    // Iterate through each of the N given points
    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        // Read the coordinates (row, column) of the current point
        const currentPointCoords = fetchNextLine().split(" ");
        const pointRow = parseInt(currentPointCoords[0], 10); // Row coordinate of the point
        const pointCol = parseInt(currentPointCoords[1], 10); // Column coordinate of the point

        // For each point, consider all possible 3x3 subgrids that *could* contain this point.
        // A 3x3 subgrid is defined by its top-left corner (currRow, currCol).
        // If the point (pointRow, pointCol) is within a 3x3 subgrid, then its top-left corner (currRow, currCol)
        // must satisfy: currRow <= pointRow <= currRow + 2 AND currCol <= pointCol <= currCol + 2.
        // This implies: pointRow - 2 <= currRow <= pointRow AND pointCol - 2 <= currCol <= pointCol.
        for (let currRow = pointRow - 2; currRow <= pointRow; currRow++) {
            // Ensure the top-left row of the 3x3 subgrid is within valid grid boundaries.
            // A 3x3 subgrid must fit entirely within the grid, so its top-left row cannot be less than 1
            // and its bottom-right row (currRow + 2) cannot exceed gridHeight.
            // Thus, currRow must be between 1 and gridHeight - 2.
            if (currRow >= 1 && currRow <= gridHeight - 2) {
                for (let currCol = pointCol - 2; currCol <= pointCol; currCol++) {
                    // Similarly, ensure the top-left column of the 3x3 subgrid is within valid grid boundaries.
                    // currCol must be between 1 and gridWidth - 2.
                    if (currCol >= 1 && currCol <= gridWidth - 2) {
                        // Construct a unique string key for this 3x3 subgrid based on its top-left corner
                        const cellKey = "r" + currRow.toString() + "_c" + currCol.toString();

                        // Increment the count for this specific 3x3 subgrid
                        if (coordinateCounts[cellKey] === undefined) {
                            coordinateCounts[cellKey] = 1; // Initialize if first time
                        } else {
                            coordinateCounts[cellKey]++;    // Increment existing count
                        }
                    }
                }
            }
        }
    }

    // Initialize an array to store the final answer:
    // resultCounts[k] will store the number of 3x3 subgrids that were affected exactly 'k' times.
    // The maximum possible hits for a single 3x3 subgrid is 9 (if all 9 cells are points).
    const resultCounts = [];
    for (let k = 0; k < 10; k++) {
        resultCounts.push(0); // Initialize all counts from 0 to 9 to zero
    }

    // The total number of possible 3x3 subgrids in the grid is (gridHeight - 2) * (gridWidth - 2).
    // Initially, assume all these subgrids are affected 0 times.
    resultCounts[0] = (gridHeight - 2) * (gridWidth - 2);

    // Now, iterate through the subgrids that were actually affected (i.e., present in coordinateCounts)
    for (const cellIdentifier in coordinateCounts) {
        // For each affected subgrid, it means it was NOT affected 0 times.
        // So, decrement the count of subgrids affected 0 times.
        resultCounts[0]--;
        // Increment the count for the specific number of times this subgrid was affected.
        // coordinateCounts[cellIdentifier] gives the number of times this particular subgrid was hit.
        resultCounts[coordinateCounts[cellIdentifier]]++;
    }

    // Output the final counts for each category (0 to 9 times affected)
    for (let outputIdx = 0; outputIdx < 10; outputIdx++) {
        console.log(resultCounts[outputIdx].toString());
    }
}
