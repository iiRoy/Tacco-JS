"use strict" // Enforce strict mode for cleaner code execution

// Function to determine if target sums can be formed from a given set of numbers
const calculateInclusions = (totalElementsCount, sourceArray, queryCount, targetValues) => {
    // A collection to store all unique sums achievable from the source numbers.
    // Using a Set provides efficient lookups later.
    const possibleSums = new Set();

    // Iterate through all possible subsets using bit manipulation.
    // Each 'currentMask' represents a unique combination of elements.
    for (let currentMask = 0; currentMask < (1 << totalElementsCount); currentMask++) {
        let currentSummation = 0; // Initialize sum for the current subset.

        // Examine each element in the source array.
        for (let idx = 0; idx < totalElementsCount; idx++) {
            // If the idx-th bit is set in 'currentMask', include the idx-th element.
            if ((currentMask & (1 << idx)) !== 0) {
                currentSummation += sourceArray[idx]; // Add the element's value to the sum.
            }
        }
        // Only add non-zero sums to our collection of possibilities.
        if (currentSummation !== 0) {
            possibleSums.add(currentSummation);
        }
    }

    // Prepare a list to hold the "yes" or "no" answers for each query.
    const finalDecisions = [];

    // Process each query value provided.
    for (let idx = 0; idx < queryCount; idx++) {
        // Check if the current query value exists within our set of possible sums.
        if (possibleSums.has(targetValues[idx])) {
            finalDecisions.push("yes"); // If found, record "yes".
        } else {
            finalDecisions.push("no"); // Otherwise, record "no".
        }
    }

    return finalDecisions; // Return the array of results for all queries.
};

let processedLines = 0; // Counter for the number of input lines read.
let totalElementsCount = 0; // Stores the count of numbers in the main array.
let inputNumbers = null; // The array of numbers from which sums are formed.
let numQueries = 0; // The count of query values.
let targetValues = null; // The array of values to be checked against sums.

// Setup the interface for reading input line by line from standard input.
const inputProcessor = require("readline").createInterface({
    input: process.stdin,  // Input source is standard input.
    output: process.stdout // Output is standard output (though not directly used for prompting).
});

// Event listener for each line of input received.
inputProcessor.on("line", (currentLineData) => {
    processedLines++; // Increment the line counter.

    if (processedLines === 1) {
        // First line contains the number of elements N.
        totalElementsCount = Number(currentLineData);
    } else if (processedLines === 2) {
        // Second line contains the space-separated elements A.
        inputNumbers = currentLineData.trim().split(" ").map(itemStr => Number(itemStr));
    } else if (processedLines === 3) {
        // Third line contains the number of queries Q.
        numQueries = Number(currentLineData);
    } else {
        // Fourth line (and subsequent if any, but in this problem, it's the last data line)
        // contains the space-separated query values M.
        targetValues = currentLineData.trim().split(" ").map(valStr => Number(valStr));

        // Once all input data is gathered, execute the primary logic.
        const finalDecisions = calculateInclusions(totalElementsCount, inputNumbers, numQueries, targetValues);

        // Output each decision on a new line.
        for (let idx = 0; idx < finalDecisions.length; idx++) {
            console.log(finalDecisions[idx]);
        }

        // Terminate the process cleanly after all output is done.
        process.exit(0);
    }
});