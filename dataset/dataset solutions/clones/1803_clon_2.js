"use strict";

// Primary function to process the entire input dataset
function processInput(rawData) {
    // Clean and split the raw input string into an array of lines
    let dataLines = rawData.trim().split("\n");
    // Extract the total number of test cases from the first line
    const testCaseCount = dataLines.shift();

    // Loop through each individual test case
    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
        // Retrieve the number of vertices (N) for the current case
        const vertexCount = dataLines[caseIndex * 3]; // N is located at index 0, 3, 6, ...
        // Parse the vertex values (A) into an array of numbers
        const vertexValues = dataLines[1 + caseIndex * 3].split(" ").map(val => Number(val)); // A is at index 1, 4, 7, ...
        // Get the operation string (S) for the current case
        const operationString = dataLines[2 + caseIndex * 3]; // S is at index 2, 5, 8, ...

        // Initialize the running XOR sum for this test case
        let currentXORSum = 0;

        // Iterate over each character in the operation string
        operationString.toString().split("").forEach((operationChar, charIndex) => {
            // Calculate the population count (number of set bits) for the potential new XOR sum
            let newXORPopCount = (currentXORSum ^ vertexValues[charIndex]).toString(2).split("").filter(bit => bit === '1').length;
            // Calculate the population count for the current XOR sum
            let currentXORPopCount = currentXORSum.toString(2).split("").filter(bit => bit === '1').length;

            // Output debug information as per original behavior
            console.log(`S${operationChar} will do..`);
            console.log(`  1 count for new = ${newXORPopCount}, or ${currentXORSum ^ vertexValues[charIndex]}`);
            console.log(`  1 count for old = ${currentXORPopCount}, or ${currentXORSum}`);

            // Apply logic based on the operation character
            if (operationChar === '0') {
                // If the operation character is '0':
                // If the new XOR sum would have more set bits than the current, do nothing.
                if (newXORPopCount > currentXORPopCount) {
                    //console.log(`    nothing`)
                } else {
                    // Otherwise, update the XOR sum.
                    //console.log(`    overwrite from ${currentXORSum.toString(2)} to ${(currentXORSum ^ vertexValues[charIndex],2).toString(2)}`)
                    currentXORSum = currentXORSum ^ vertexValues[charIndex];
                }
                //currentXORSum = currentXORSum ^ vertexValues[charIndex]
            } else { // If the operation character is '1':
                // If the new XOR sum would have more set bits than the current, update the XOR sum.
                if (newXORPopCount > currentXORPopCount) {
                    //console.log(`    overwrite from ${currentXORSum.toString(2)} to ${(currentXORSum ^ vertexValues[charIndex],2).toString(2)}`)
                    currentXORSum = currentXORSum ^ vertexValues[charIndex];
                } else {
                    // Otherwise, do nothing.
                    //console.log(`    nothing`)
                }
            }
        });

        // Print the final result for the current test case: "1" if currentXORSum is non-zero, "0" otherwise.
        console.log(`${currentXORSum ? "1" : "0"}`);
    }
}

// Execute the main processing function by reading input from standard input
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
