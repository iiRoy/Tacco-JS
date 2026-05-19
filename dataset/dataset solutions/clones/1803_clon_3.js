"use strict";

// Helper function to calculate the population count (number of set bits) of an integer.
const calculatePopCount = (numericValue) => {
    // Convert the number to its binary string representation.
    const binaryString = numericValue.toString(2);
    // Split the binary string into an array of characters, filter for '1's, and count them.
    return binaryString.split("").filter(bitChar => bitChar === '1').length;
};

function processInput(rawData) {
    // Trim whitespace and split the raw input into an array of lines.
    let processedLines = rawData.trim().split("\n");
    // The first line contains the total number of test cases.
    const testCaseCount = Number(processedLines.shift()); // Ensure it's a number for loop comparison.

    // Iterate through each test case.
    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
        // Calculate the starting index for the current test case's data.
        const currentLineOffset = caseIndex * 3;

        // Extract data for the current test case.
        // _vertexCount: The number of vertices (not used in the provided logic, but read).
        const _vertexCount = Number(processedLines[currentLineOffset]);
        // xorValues: Array of numbers for XOR operations.
        const xorValues = processedLines[currentLineOffset + 1].split(" ").map(val => Number(val));
        // operationSequence: String of '0's and '1's dictating operation logic.
        const operationSequence = processedLines[currentLineOffset + 2];

        // Initialize the XOR sum for the current test case.
        let currentXorSum = 0;

        // Process each character in the operation sequence string.
        operationSequence.split("").forEach((operationChar, charIndex) => {
            // Calculate the potential new XOR sum if an update occurs.
            const potentialNewXorSum = currentXorSum ^ xorValues[charIndex];

            // Get the population count for the potential new XOR sum.
            const newXorPopCount = calculatePopCount(potentialNewXorSum);
            // Get the population count for the current XOR sum.
            const currentXorPopCount = calculatePopCount(currentXorSum);

            // Output debug information as per original behavior.
            console.log(`S${operationChar} will do..`);
            console.log(`  1 count for new = ${newXorPopCount}, or ${potentialNewXorSum}`);
            console.log(`  1 count for old = ${currentXorPopCount}, or ${currentXorSum}`);

            // Determine if an update to currentXorSum should occur based on operationChar and pop counts.
            let shouldPerformUpdate = false;
            if (operationChar === '0') {
                // If operationChar is '0', update if the new pop count is NOT strictly greater than the old.
                shouldPerformUpdate = (newXorPopCount <= currentXorPopCount);
            } else { // operationChar === '1'
                // If operationChar is '1', update if the new pop count IS strictly greater than the old.
                shouldPerformUpdate = (newXorPopCount > currentXorPopCount);
            }

            // Apply the update if the condition is met.
            if (shouldPerformUpdate) {
                currentXorSum = potentialNewXorSum;
            }
        });

        // After processing all operations for the current test case, output the final result.
        // Output "1" if currentXorSum is non-zero, otherwise "0".
        console.log(`${currentXorSum ? "1" : "0"}`);
    }
}

// Read input from stdin and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
