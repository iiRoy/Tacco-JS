var fileSystemMod = require('fs'), // Acquire the Node.js file system module
    fileSize = fileSystemMod.fstatSync(process.stdin.fd).size, // Determine the byte size of standard input
    dataBuffer = new Buffer(fileSize), // Create a memory buffer to hold incoming data
    octetsRead = fileSystemMod.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0), // Read bytes from stdin into the buffer
    dataLines = dataBuffer.toString('utf8', 0, octetsRead).split('\n'); // Convert buffer to UTF-8 string and split by newline

// Initiate the primary execution sequence
orchestrate();

/**
 * Generates a two-dimensional array (a grid) with specified dimensions,
 * initializing all its cells with a given value.
 * @param {number} rows - The desired number of rows for the grid.
 * @param {number} cols - The desired number of columns for each row.
 * @param {*} initialValue - The default value to fill each cell of the grid.
 * @returns {Array<Array<*>>} A newly constructed 2D array.
 */
function createGrid(rows, cols, initialValue) {
    var gridArray = [],    // This array will hold all the rows of our grid
        rowIndex,          // Iterator for the row dimension
        colIndex;          // Iterator for the column dimension

    for (rowIndex = 0; rowIndex < rows; rowIndex++) {
        gridArray[rowIndex] = []; // Initialize each row as an empty array
        for (colIndex = 0; colIndex < cols; colIndex++) {
            gridArray[rowIndex][colIndex] = initialValue; // Assign the starting value to each cell
        }
    }
    return gridArray; // Deliver the completed grid structure
}

/**
 * Calculates the maximum achievable value from a collection of segments within a given total duration.
 * This function employs a dynamic programming approach to find the optimal solution.
 * @param {number} maxDuration - The maximum time or capacity constraint.
 * @param {Array<Array<number>>} segmentList - An array where each element is a segment defined by [start_time, duration_length, associated_profit].
 * @returns {number} The highest possible profit that can be obtained.
 */
function calculateOptimalValue(maxDuration, segmentList) {
    var numSegments = segmentList.length, // Total count of available segments
        dynamicProgramTable = createGrid(numSegments + 1, maxDuration + 1, 0), // DP table to store subproblem solutions, initialized to zero
        segmentIdx,     // Loop variable for iterating through segments
        durationIdx,    // Loop variable for iterating through possible durations
        prevDurationIdx, // Loop variable for looking back at previous duration states
        segmentStart,   // The starting point of the current segment
        segmentLength,  // The duration or length of the current segment
        segmentProfit,  // The value or profit gained from the current segment
        currentMax;     // Variable to hold the maximum profit found in a specific sub-range

    // Iterate through each segment available
    for (segmentIdx = 0; segmentIdx < numSegments; segmentIdx++) {
        // Iterate through all possible duration values from zero up to the maximum allowed
        for (durationIdx = 0; durationIdx <= maxDuration; durationIdx++) {
            // Extract the properties of the segment currently being considered
            segmentStart = segmentList[segmentIdx][0];
            segmentLength = segmentList[segmentIdx][1];
            segmentProfit = segmentList[segmentIdx][2];

            // Check if the current segment's start time allows it to be placed within the current duration
            if (segmentStart <= durationIdx) {
                // Reset the maximum search value for this particular DP state
                currentMax = 0;

                // Search for the best previous state that allows incorporating the current segment.
                // The range for previous durations is from (durationIdx - segmentLength) up to (durationIdx - segmentStart).
                for (prevDurationIdx = segmentLength > durationIdx ? 0 : durationIdx - segmentLength;
                     prevDurationIdx <= durationIdx - segmentStart;
                     prevDurationIdx++) {
                    if (currentMax < dynamicProgramTable[segmentIdx + 1][prevDurationIdx]) {
                        currentMax = dynamicProgramTable[segmentIdx + 1][prevDurationIdx];
                    }
                }
                // Update the DP table: choose between not using the current segment (inheriting from previous segmentIdx)
                // or using it (current segment's profit plus the best previous state).
                dynamicProgramTable[segmentIdx + 1][durationIdx] = Math.max(dynamicProgramTable[segmentIdx][durationIdx], currentMax + segmentProfit);
//        range = dp[i + 1].slice(l > j ? 0: j - l, j - s + 1);
//        dp[i + 1][j] = Math.max(dp[i][j], Math.max.apply(null, max) + p);
            } else {
                // If the segment cannot be used (its start time is too late),
                // simply carry over the value from the previous segment without using this one.
                dynamicProgramTable[segmentIdx + 1][durationIdx] = dynamicProgramTable[segmentIdx][durationIdx];
            }
        }
    }
//  console.log(dp); // Debugging output for the DP table
    // The final optimal value is found at the cell corresponding to all segments and the maximum duration.
    return dynamicProgramTable[numSegments][maxDuration];
}

/**
 * Manages the primary execution flow of the application.
 * This includes reading initial data, processing queries, and displaying results.
 */
function orchestrate() {

    // Read the total number of pattern entries from the input stream
    var numEntries = parseFloat(dataLines.shift()),
        patternList = []; // Initialize an array to store all parsed patterns

    // Loop to populate the pattern list from the input lines
    for (var idx = 0; idx < numEntries; idx++) {
        patternList.push(dataLines.shift().split(' ').map(parseFloat)); // Parse each line as numbers and add to list
    }
//  n = phraseList.length; // Original code comment, not used
//  phraseList.sort(function (a, b) { // Original code comment, not used
//    return a[2] - b[2];
//  });
//  console.log(phraseList) // Original code comment, not used

    // Read the number of duration queries to be processed
    var numQueries = parseFloat(dataLines.shift()),
        queryDurations = [], // Array to hold the list of durations for which to compute results
        currentDuration,    // Variable to store the duration for the current query
        resultValues = [],  // Array to collect the computed optimal values
        queryIdx,           // Loop index for iterating through queries
        tempIdx,            // A general-purpose temporary index, though not extensively used here
        computedValue,      // The result obtained from `calculateOptimalValue` for a specific query
        allSuccess = true;  // Flag to indicate if all calculations yielded a non-zero (successful) result

    // Populate the list of durations from the input
    for (queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        queryDurations.push(parseFloat(dataLines.shift())); // Convert and add each duration to the list
    }

    // Process each duration query to find its optimal value
    for (queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        currentDuration = queryDurations[queryIdx]; // Get the duration for the current query
        computedValue = calculateOptimalValue(currentDuration, patternList); // Perform the DP calculation
//    console.log(max) // Debugging output

        // Check if the computed value is zero, which might indicate a failure or no possible solution
        if (computedValue === 0) {
            allSuccess = false; // Set the failure flag
        } else {
            resultValues.push(computedValue); // Store the successful result
        }
    }

    // Based on the success flag, output either an error or the collected results
    if (!allSuccess) {
        console.log(-1); // Output -1 if any query resulted in zero profit
        return;          // Terminate the function early
    }
    // If all queries were successful, print each result on a new line
    resultValues.forEach(function (val) {
        console.log(val);
    });

}