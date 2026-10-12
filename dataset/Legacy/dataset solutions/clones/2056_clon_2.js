function ProcessInput(rawData) {
    // Process the raw input string into a structured array
    let processedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Parse dimensions and limit from the first line
    const heightVal = parseInt(processedLines[0][0], 10);
    const widthVal = parseInt(processedLines[0][1], 10);
    const limitVal = parseInt(processedLines[0][2], 10);

    // Initialize arrays for the original matrix and its prefix sums
    let matrixData = [];
    let prefixSums = [];
    let tempVar;

    // Populate matrixData and calculate prefixSums for each row
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        matrixData.push(processedLines[rowIdx + 1][0].split("").map(element => parseInt(element, 10)));
        prefixSums.push([0]); // Start with 0 for prefix sum
        tempVar = 0;
        for (let colIdx = 0; colIdx < widthVal; colIdx++) {
            tempVar += matrixData[rowIdx][colIdx];
            prefixSums[rowIdx].push(tempVar);
        }
    }

    // N represents the number of possible horizontal cuts (H-1)
    const numRowsMinusOne = heightVal - 1;
    let rowDivisions;
    let currentRows;
    let currentColSums;
    let horizontalCuts;
    let verticalCuts;
    let minCuts = (heightVal - 1) + (widthVal - 1); // Initialize with max possible cuts

    // Main loop: Iterate through all possible horizontal cut configurations
    mainIteration:
    for (let configIdx = 0; configIdx < Math.pow(2, numRowsMinusOne); configIdx++) {
        // Handle the special case where there are no horizontal cuts possible (H=1)
        if (numRowsMinusOne === 0) {
            currentRows = [prefixSums[0].slice()];
            horizontalCuts = 0;
        } else {
            // Initialize row division tracking array
            rowDivisions = [0, 1, 2, 3, 4, 5, 6, 7]; // Max 8 rows, adjust if needed
            rowDivisions.length = heightVal;
            currentRows = [prefixSums[0].slice()]; // Start with the first row's prefix sums

            // Convert configIdx to a binary string to represent horizontal cuts
            tempVar = configIdx.toString(2);
            tempVar = ('0'.repeat(numRowsMinusOne) + tempVar).substr(-1 * numRowsMinusOne);
            horizontalCuts = 0;

            // Apply horizontal cuts based on the binary string
            for (let bitIdx = 0; bitIdx < tempVar.length; bitIdx++) {
                if (tempVar.substr(bitIdx, 1) === '0') {
                    // No cut: merge current row with the previous group
                    rowDivisions[bitIdx + 1] = rowDivisions[bitIdx];
                    currentRows[currentRows.length - 1] = VectorOperation(currentRows[currentRows.length - 1], prefixSums[bitIdx + 1], '+');
                } else {
                    // Cut: start a new group of rows
                    currentRows.push(prefixSums[bitIdx + 1].slice());
                    horizontalCuts++;
                }
            }
        }

        // Initialize current column sums for each row group and vertical cuts
        currentColSums = [0, 0, 0, 0, 0, 0, 0, 0];
        currentColSums.length = currentRows.length;
        verticalCuts = [];

        // Iterate through columns to determine vertical cuts
        for (let colIdx = 1; colIdx <= widthVal; colIdx++) {
            columnIteration:
            for (let sumIdx = 0; sumIdx < currentRows.length; sumIdx++) {
                // Check if the sum of elements in the current group exceeds the limitVal
                if (currentRows[sumIdx][colIdx] - currentColSums[sumIdx] > limitVal) {
                    // If it exceeds and it's the first column, or the previous column already had a cut,
                    // this configuration is invalid. Move to the next horizontal cut configuration.
                    if (colIdx === 1 || verticalCuts[verticalCuts.length - 1] === colIdx - 1) {
                        continue mainIteration;
                    }
                    // Otherwise, a vertical cut is needed before this column
                    verticalCuts.push(colIdx - 1); // Cut between colIdx-1 and colIdx
                    // Reset current column sums for all groups to the values before the cut
                    for (let resetIdx = 0; resetIdx < currentRows.length; resetIdx++) {
                        currentColSums[resetIdx] = currentRows[resetIdx][colIdx - 1];
                    }
                    colIdx--; // Re-evaluate the current column after the cut
                    break columnIteration; // Break from inner loop to re-evaluate current column
                }
            }
        }
        // Update the minimum number of cuts found so far
        minCuts = Math.min(minCuts, horizontalCuts + verticalCuts.length);
    }
    console.log(minCuts);
}

// Helper function for vector operations (addition, subtraction, etc.)
function VectorOperation(vecA, vecB, operationType) {
    let resultVec = [];
    // Handle cases where vector lengths might differ (e.g., scalar operation)
    if (vecA.length !== vecB.length) {
        if (vecB.length === 1) {
            // If vecB is a single element, treat it as a scalar to be applied to all elements of vecA
            vecB = Array.from({ length: (vecA.length) }, () => vecB[0]);
        } else {
            return null; // Return null for incompatible vector lengths
        }
    }

    // Perform the specified operation element-wise
    for (let idx = 0; idx < vecA.length; idx++) {
        if (operationType === '+') {
            resultVec.push(vecA[idx] + vecB[idx]);
        }
        if (operationType === '-') {
            resultVec.push(vecA[idx] - vecB[idx]);
        }
        if (operationType === '*') {
            resultVec.push(vecA[idx] * vecB[idx]);
        }
        if (operationType === '/') {
            resultVec.push(vecA[idx] / vecB[idx]);
        }
        if (operationType === '%') {
            resultVec.push(vecA[idx] % vecB[idx]);
        }
        if (operationType === '||') { // Custom operation for maximum
            resultVec.push(Math.max(vecA[idx], vecB[idx]));
        }
    }
    return resultVec;
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
