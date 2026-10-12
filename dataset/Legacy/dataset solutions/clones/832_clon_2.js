const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is read as a single string, then trimmed and split into an array of lines.
let lineBuffer = rawData.trim().split("\n");

// Main processing loop continues until a specific termination condition is met.
while (true) {
    // Read the first line of the current block, which contains N and M dimensions.
    const dimensionsStr = lineBuffer.shift().split(" ");

    // Check for the termination condition "0 0".
    if (dimensionsStr.join(" ") === "0 0") {
        break; // Exit the loop if "0 0" is encountered.
    }

    // Parse the N and M values from the dimensions string.
    const numN = Number(dimensionsStr[0]);
    const numM = Number(dimensionsStr[1]);

    // Initialize an array to store M values.
    const mValues = [];
    // Populate the mValues array by shifting elements from the line buffer.
    for (let mValIdx = 0; mValIdx < numM; mValIdx++) {
        mValues.push(Number(lineBuffer.shift()));
    }

    // Initialize an array to store N values.
    const nValues = [];
    // Populate the nValues array by shifting elements from the line buffer.
    for (let rowIdx = 0; rowIdx < numN; rowIdx++) {
        nValues.push(Number(lineBuffer.shift()));
    }

    // Initialize the dynamic programming table.
    // dp[i][j] will store the minimum cost to process the first 'i' N values
    // ending with a 'j' value (0-255).
    const dynamicProgTable = [];
    for (let idxA = 0; idxA <= numN; idxA++) {
        dynamicProgTable[idxA] = [];
        for (let idxB = 0; idxB <= 255; idxB++) {
            dynamicProgTable[idxA][idxB] = Infinity; // Initialize with a very large value.
        }
    }

    // Base case: For the first N value (index 0), starting at 128, the cost is 0.
    dynamicProgTable[0][128] = 0;

    // Fill the dynamic programming table.
    // Iterate through each N value.
    for (let rowIdx = 1; rowIdx <= numN; rowIdx++) {
        // Iterate through all possible previous 'j' values (0-255).
        for (let colIdx = 0; colIdx <= 255; colIdx++) {
            // If the previous state was reachable (not Infinity).
            if (dynamicProgTable[rowIdx - 1][colIdx] !== Infinity) {
                // Consider all possible M values to transition to the current state.
                for (let mValIdx = 0; mValIdx < numM; mValIdx++) {
                    // Calculate the new 'j' value by adding M[k] to the previous 'j'.
                    let adjustedJ = colIdx + mValues[mValIdx];

                    // Clamp the 'j' value to be within the 0-255 range.
                    if (adjustedJ < 0) {
                        adjustedJ = 0;
                    }
                    if (adjustedJ > 255) {
                        adjustedJ = 255;
                    }

                    // Calculate the cost for the current transition.
                    // The cost is the previous state's cost plus the squared difference
                    // between the current N value and the new 'j' value.
                    const currentTransitionCost = dynamicProgTable[rowIdx - 1][colIdx] + Math.pow(nValues[rowIdx - 1] - adjustedJ, 2);

                    // Update the DP table with the minimum cost found so far for this state.
                    dynamicProgTable[rowIdx][adjustedJ] = Math.min(
                        dynamicProgTable[rowIdx][adjustedJ],
                        currentTransitionCost
                    );
                }
            }
        }
    }

    // After filling the DP table, find the minimum cost in the last row (for numN N values).
    let minimumCost = Infinity;
    dynamicProgTable[numN].forEach(function(currentCost) {
        minimumCost = Math.min(minimumCost, currentCost);
    });

    // Output the calculated minimum cost.
    console.log(minimumCost);
}
