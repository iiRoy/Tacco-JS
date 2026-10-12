process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawInputBuffer = ""; // Accumulates all incoming standard input data
let inputLinesArray = []; // Stores individual lines after splitting the buffer
let currentLineIndex = 0; // Tracks the current line being read from inputLinesArray

process.stdin.on('data', function (incomingDataChunk) {
    rawInputBuffer += incomingDataChunk; // Append new data to the buffer
});

process.on('SIGINT', function() {
    // On receiving an interrupt signal (e.g., Ctrl+C), process input and run the solution
    inputLinesArray = rawInputBuffer.split("\n");
    executeSolution(); // Invoke the main logic function
    process.exit(); // Terminate the process gracefully
});

process.stdin.on('end', function () {
    // When all standard input has been received, split it into lines and execute the solution
    inputLinesArray = rawInputBuffer.split("\n");
    executeSolution();
});

function fetchNextLine() {
    // Retrieves the next line from the pre-processed input array and advances the index
    return inputLinesArray[currentLineIndex++];
}

/////////////// ignore above this line ////////////////////

function executeSolution() {
    // A large constant representing an unreachable state or infinity in DP
    const infinityVal = 1000000000;

    /* This implements a dynamic programming approach, akin to a 2D knapsack problem,
       to find the minimum cost to achieve specific sums of 'a' and 'b' values. */

    // Read the first line containing problem parameters: N, Ma, Mb
    let lineParts = fetchNextLine().split(" ");
    const numItems = parseInt(lineParts[0]); // Total number of items available
    const targetA = parseInt(lineParts[1]);  // Target 'a' value for the ratio
    const targetB = parseInt(lineParts[2]);  // Target 'b' value for the ratio

    // Initialize arrays to store properties of each item.
    // Using 1-based indexing for convenience, hence the initial dummy '0' element.
    const itemAValues = [0]; // Stores the 'a' property for each item
    const itemBValues = [0]; // Stores the 'b' property for each item
    const itemCosts = [0];   // Stores the 'cost' property for each item

    // Populate the item property arrays by reading subsequent input lines
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        lineParts = fetchNextLine().split(" ");
        itemAValues.push(parseInt(lineParts[0]));
        itemBValues.push(parseInt(lineParts[1]));
        itemCosts.push(parseInt(lineParts[2]));
    }

    /* Initialize the DP table (memoTable).
       It's a flattened 2D array where memoTable[sumA * stride + sumB] stores the minimum cost
       to achieve a total 'a' sum of `sumA` and a total 'b' sum of `sumB`.
       The maximum possible sum for 'a' or 'b' is constrained to 10 * N.
       The table dimensions are slightly larger (11 * N + 1) to accommodate sums up to 10 * N. */
    const memoTable = [];
    // Fill the entire table with infinityVal initially
    for (let i = 0; i <= 11 * numItems; i++) {
        for (let j = 0; j <= 11 * numItems; j++) {
            memoTable.push(infinityVal);
        }
    }
    // Base case: It costs 0 to achieve sums of 0 for both 'a' and 'b'
    memoTable[0] = 0;

    // Helper function to map 2D coordinates (sumA, sumB) to a 1D array index
    function calculateTableIndex(sumA, sumB) {
        // The stride for the 'a' dimension is 11 * numItems, as per the original logic.
        return sumA * (11 * numItems) + sumB;
    }

    // Iterate through each item to update the DP table
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        // Iterate through possible 'a' sums in reverse order
        for (let currentSumA = 10 * numItems; currentSumA >= 0; currentSumA--) {
            // Iterate through possible 'b' sums in reverse order
            for (let currentSumB = 10 * numItems; currentSumB >= 0; currentSumB--) {
                // Check if it's possible to consider adding the current item to reach this state.
                // The condition `currentSumA - itemAValues[itemIdx] >= 0 || currentSumB - itemBValues[itemIdx] >= 0`
                // effectively ensures that both `currentSumA - itemAValues[itemIdx]` and `currentSumB - itemBValues[itemIdx]`
                // are non-negative for a valid update to occur, because negative indices would lead to `undefined`
                // and `undefined + cost` results in `NaN`, which won't satisfy the update condition.
                if (currentSumA - itemAValues[itemIdx] >= 0 || currentSumB - itemBValues[itemIdx] >= 0) {
                    const currentTablePosition = calculateTableIndex(currentSumA, currentSumB);
                    const previousTablePosition = calculateTableIndex(currentSumA - itemAValues[itemIdx], currentSumB - itemBValues[itemIdx]);

                    // If the previous state was reachable and adding the current item offers a lower cost, update.
                    if (memoTable[currentTablePosition] > memoTable[previousTablePosition] + itemCosts[itemIdx]) {
                        memoTable[currentTablePosition] = memoTable[previousTablePosition] + itemCosts[itemIdx];
                    }
                }
            }
        }
    }

    // After filling the DP table, find the minimum cost for states that match the target ratio.
    // We are looking for states (targetA * factor, targetB * factor) for various factors.
    let finalResult = infinityVal;
    for (let factor = 1; factor <= 10; factor++) {
        const currentTargetSumA = targetA * factor;
        const currentTargetSumB = targetB * factor;

        // Calculate the 1D index for the current target sum combination.
        // Accessing out-of-bounds indices will result in `undefined`, which correctly
        // prevents updates as `finalResult > undefined` is false.
        const currentPosition = calculateTableIndex(currentTargetSumA, currentTargetSumB);

        // Update the minimum result if a lower cost is found for a valid target state.
        if (finalResult > memoTable[currentPosition]) {
            finalResult = memoTable[currentPosition];
        }
    }

    // Output the final result based on whether a valid combination was found
    if (finalResult === infinityVal) {
        console.log("-1\n"); // If no combination matching the ratio was found
    } else {
        console.log(finalResult.toString()); // Output the minimum cost found
    }
}
