var inputDataRows = []; // This array will store all lines read from standard input.

// Declare variables for problem parameters and the 2D cumulative sum array.
var maxCoordinateValue, totalPairsCount, totalQueriesCount;
var cumulativeFrequencyGrid;

// Import the 'readline' module for handling input.
var readline = require('readline');

// Create an interface for reading input line by line.
var inputLineReader = readline.createInterface({
    input: process.stdin,  // Standard input stream
    output: process.stdout // Standard output stream (not used for output here, but required by interface)
});

// Event listener for each line of input received.
inputLineReader.on('line', function (currentInputLine) {
    inputDataRows.push(currentInputLine); // Add the line to our collection.
});

// Event listener for when the input stream closes (all lines have been read).
inputLineReader.on('close', function () {
    // Parse the first line to get N, M, Q.
    var firstLineParts = inputDataRows[0].split(" ");
    maxCoordinateValue = Number(firstLineParts[0]);
    totalPairsCount = Number(firstLineParts[1]);
    totalQueriesCount = Number(firstLineParts[2]);

    // Initialize the 2D cumulative frequency grid.
    // It's (N+1) x (N+1) and filled with zeros.
    cumulativeFrequencyGrid = Array(maxCoordinateValue + 1).fill(0).map(function() {
        return Array(maxCoordinateValue + 1).fill(0);
    });

    // Arrays to store the left and right endpoints of the M pairs.
    var leftEndpoints = Array(totalPairsCount);
    var rightEndpoints = Array(totalPairsCount);

    // Read and parse the M pairs.
    for (var pairIdx = 0; pairIdx < totalPairsCount; pairIdx++) {
        var lineSegments = inputDataRows[pairIdx + 1].split(" ");
        leftEndpoints[pairIdx] = Number(lineSegments[0]);
        rightEndpoints[pairIdx] = Number(lineSegments[1]);
    }

    // Arrays to store the start and end coordinates of the Q queries.
    var queryStartCoords = Array(totalQueriesCount);
    var queryEndCoords = Array(totalQueriesCount);

    // Read and parse the Q queries.
    for (var queryIdx = 0; queryIdx < totalQueriesCount; queryIdx++) {
        var lineSegments = inputDataRows[queryIdx + totalPairsCount + 1].split(" ");
        queryStartCoords[queryIdx] = Number(lineSegments[0]);
        queryEndCoords[queryIdx] = Number(lineSegments[1]);
    }

    // Build the cumulative sum table using the parsed pairs.
    generateCumulativeSumTable(leftEndpoints, rightEndpoints);

    // Process each query and print the result.
    for (var queryIdx = 0; queryIdx < totalQueriesCount; queryIdx++) {
        // Calculate the sum for the current query using the 2D prefix sum technique.
        var queryResult = cumulativeFrequencyGrid[queryEndCoords[queryIdx]][queryEndCoords[queryIdx]]
                        - cumulativeFrequencyGrid[queryEndCoords[queryIdx]][queryStartCoords[queryIdx] - 1]
                        - cumulativeFrequencyGrid[queryStartCoords[queryIdx] - 1][queryEndCoords[queryIdx]]
                        + cumulativeFrequencyGrid[queryStartCoords[queryIdx] - 1][queryStartCoords[queryIdx] - 1];
        console.log(queryResult); // Output the calculated result.
    }
});

/**
 * Populates the global cumulativeFrequencyGrid based on the given left and right endpoints.
 * This function implements a 2D prefix sum algorithm.
 * @param {number[]} leftEndpoints_param - An array of left endpoints for the pairs.
 * @param {number[]} rightEndpoints_param - An array of right endpoints for the pairs.
 */
function generateCumulativeSumTable(leftEndpoints_param, rightEndpoints_param) {
    // Increment the count at each (L, R) coordinate in the grid.
    for (var pairIter = 0; pairIter < totalPairsCount; pairIter++) {
        cumulativeFrequencyGrid[leftEndpoints_param[pairIter]][rightEndpoints_param[pairIter]]++;
    }

    // Calculate the 2D cumulative sums.
    // Iterate through rows and columns starting from 1 (since 0 is base case).
    for (var rowIter = 1; rowIter <= maxCoordinateValue; rowIter++) {
        for (var colIter = 1; colIter <= maxCoordinateValue; colIter++) {
            // Apply the 2D prefix sum formula:
            // cumulativeFrequencyGrid[r][c] = current_value + cumulativeFrequencyGrid[r-1][c] + cumulativeFrequencyGrid[r][c-1] - cumulativeFrequencyGrid[r-1][c-1]
            cumulativeFrequencyGrid[rowIter][colIter] += cumulativeFrequencyGrid[rowIter - 1][colIter];
            cumulativeFrequencyGrid[rowIter][colIter] += cumulativeFrequencyGrid[rowIter][colIter - 1];
            cumulativeFrequencyGrid[rowIter][colIter] -= cumulativeFrequencyGrid[rowIter - 1][colIter - 1];
        }
    }
}
