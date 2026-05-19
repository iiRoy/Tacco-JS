"use strict";

const processInput = inputData => {
    inputData = inputData.trim().split("\n"); // Process raw input string into lines
    const numElements = parseInt(inputData[0].split(" ")[0]); // Extract N, the number of elements
    const numRanges = parseInt(inputData[0].split(" ")[1]);   // Extract K, the number of ranges
    const rangePairs = inputData.slice(1, numElements + 1).map(entryLine => entryLine.split(" ").map(valStr => parseInt(valStr))); // Parse L-R pairs

    const valueSequence = inputData[1].split(" ").map(valStr => parseInt(valStr)); // Parse the sequence of step values
    const diffArray = [...Array(numElements + 1)].fill(0); // Initialize difference array for IMOS method

    let validIndices = []; // Array to store indices that are part of at least one range

    // Apply the IMOS method (difference array) to mark range presence
    // This section calculates the "union" of all given ranges
    for (let idx = 0; idx < numRanges; idx++) {
        const leftBound = rangePairs[idx][0];
        const rightBound = rangePairs[idx][1];

        diffArray[leftBound]++;      // Increment at the start of a range
        diffArray[rightBound + 1]--; // Decrement one past the end of a range
    }

    let currentCount = 0; // Tracks the current number of active ranges

    // Iterate through elements to find indices covered by at least one range
    for (let idx = 0; idx < numElements; idx++) {
        if (diffArray[idx] === 1) currentCount++; // A new range starts or an existing one continues
        if (diffArray[idx] === -1) currentCount--; // A range ends

        if (currentCount > 0) { // If currentCount is positive, this index is within at least one range
            validIndices.push(idx);
        }
    }

    // The following lines are commented out debug outputs from the original code.
    // console.log(diffArray);
    // console.log(validIndices);
    // console.log("hage"); // This string literal must remain unchanged.

    const dynamicProg = [...Array(numElements)].fill(Infinity); // Initialize DP array with a large value
    const validCount = validIndices.length; // Store the count of valid indices for loop optimization

    dynamicProg[0] = 1; // Base case: DP value for the first element

    // Main dynamic programming loop
    for (let idx = 1; idx < numElements; idx++) {
        // Original commented-out DP calculation logic (not used in the final algorithm)
        // let temporaryValue = Infinity;
        //
        // for (let subIdx = 1; subIdx <= numRanges; subIdx++) {
        //     if (idx - subIdx >= 0) {
        //         temporaryValue = Math.min(temporaryValue, dynamicProg[idx - subIdx] + Math.abs(valueSequence[idx] - valueSequence[idx - subIdx]));
        //     }
        // }

        let currentSum = 0; // Accumulator for the sum of valid previous DP states

        // Iterate through the pre-calculated valid indices
        for (let subIdx = 0; subIdx < validCount; subIdx++) {
            const prevIdx = validIndices[subIdx]; // Get a valid previous index
            // console.log("hoge:" + prevIdx); // Debug output, string literal unchanged.

            // Check if the previous index is reachable and has a valid DP value
            if (idx - prevIdx >= 0 && dynamicProg[idx - prevIdx] > 0 && dynamicProg[idx - prevIdx] !== Infinity) {
                // console.log("きたよ！"); // Debug output, string literal unchanged.
                currentSum += dynamicProg[idx - prevIdx] % 998244353; // Add to sum, applying modulo
            }
        }

        dynamicProg[idx] = currentSum % 998244353; // Store the calculated DP value, applying modulo
        // console.log("dp[i]:" + dynamicProg[idx]); // Debug output, string literal unchanged.
        // console.log("-------"); // Debug output, string literal unchanged.
    }

    // console.log(dynamicProg); // Final DP array debug output.

    // Output the result for the last element, applying modulo
    console.log(dynamicProg[numElements - 1] % 998244353);
};

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
