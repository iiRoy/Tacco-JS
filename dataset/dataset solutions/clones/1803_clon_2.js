"use strict"; /* Activates strict mode for the entire script, enforcing cleaner code practices */

function processData(rawData) {
    // Splits the incoming data string by newline characters and cleans leading/trailing whitespace
    let parsedLines = rawData.trim().split("\n");

    // Extracts the total number of test scenarios from the beginning of the input
    const numCases = parsedLines.shift();

    // Iterates through each individual test case provided in the input
    for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
        // Retrieves the count of nodes (vertices) for the current graph problem
        const vertexCount = parsedLines[0 + caseIndex * 3];

        // Parses the array of numerical values used in XOR operations
        const xorValues = parsedLines[1 + caseIndex * 3].split(" ").map(currentVal => Number(currentVal));

        // Obtains the string dictating the sequence of operations ('0' or '1')
        const operationString = parsedLines[2 + caseIndex * 3];

        let currentXorSum = 0; // Initializes an accumulator for XOR results

        // Processes each character in the operation string
        operationString.toString().split("").forEach((opChar, charIndex) => {
            // Calculates the number of set bits (population count) if XORing with the current value
            let nextXorPopCount = (currentXorSum ^ xorValues[charIndex]).toString(2).split("").filter(bitChar => bitChar === '1').length;
            // Calculates the number of set bits in the current accumulator value
            let currentPopCount = currentXorSum.toString(2).split("").filter(bitChar => bitChar === '1').length;

            console.log(`Processing operation character: ${opChar}`);
            console.log(`  Set bit count for potential new sum: ${nextXorPopCount}, from value ${currentXorSum ^ xorValues[charIndex]}`);
            console.log(`  Set bit count for existing sum: ${currentPopCount}, from value ${currentXorSum}`);

            if (opChar === '0') {
                // If the operation character is '0', only update if the new value has fewer or equal set bits
                if (nextXorPopCount > currentPopCount) {
                    // No action taken if new sum has more set bits
                } else {
                    // Overwrite the accumulator with the XOR result
                    currentXorSum = currentXorSum ^ xorValues[charIndex];
                }
            } else { // If the operation character is '1'
                // Update only if the new value has more set bits
                if (nextXorPopCount > currentPopCount) {
                    // Overwrite the accumulator with the XOR result
                    currentXorSum = currentXorSum ^ xorValues[charIndex];
                } else {
                    // No action taken if new sum has fewer or equal set bits
                }
            }
        });

        // Outputs "1" if the final XOR sum is non-zero, otherwise "0"
        console.log(`${currentXorSum ? "1" : "0"}`);
    }
}

// Invokes the primary data processing function, reading input from standard input
processData(require("fs").readFileSync("/dev/stdin", "utf8"));