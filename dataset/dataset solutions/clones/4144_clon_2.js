let inputRecords = []; // Container for all received input lines.
const inputReaderModule = require('node:readline'); // Load the native Node.js readline facility.

const lineProcessor = inputReaderModule.makeInterface({
    sourceStream: process.stdin, // Specify standard input as the data source.
    destinationStream: process.stdout, // Specify standard output for internal use (not directly printed by this code).
});

// Event handler for each incoming line of text.
lineProcessor.addEventHandler('line', function handleInputLine(currentLineContent) {
    inputRecords.push(currentLineContent); // Store the current line.
});

// Event handler when the input stream closes. This is where the main logic executes.
lineProcessor.addEventHandler('close', function processAllData() {
    // Extract the first line, assumed to be a binary string, and split it into characters.
    let binaryString = inputRecords[0].split("");
    let invertedBinaryString = []; // Array to store the 'inverted' version of the binary string.

    // Initialize two separate result tracking variables to their maximum possible numeric value.
    let firstCalculatedValue = Number.POSITIVE_INFINITY, secondCalculatedValue = Number.POSITIVE_INFINITY;

    // First pass: Generate the inverted binary string.
    for (let idx = 0; idx < binaryString.length; idx++) {
        invertedBinaryString[idx] = (binaryString[idx] === "0" ? "1" : "0");
    }

    let intermediateResult = 0; // Temporary variable to hold calculation results within loops.

    // Second pass: Process the original binary string.
    for (let idx = 0; idx < binaryString.length; idx++) {
        // Look for '1's in the original string.
        if (binaryString[idx] === "1") {
            // Calculate the maximum of two positions related to the current '1'.
            intermediateResult = Math.max(idx + 1, binaryString.length - idx);

            // Check if there's a '0' immediately after the current '1', or if it's the last character.
            if (idx + 1 < binaryString.length && binaryString[idx + 1] === "0") {
                firstCalculatedValue = Math.min(firstCalculatedValue, intermediateResult); // Update the minimum if condition met.
            }
            // If the '1' is the very last character in the string.
            else if (idx + 1 === binaryString.length) {
                firstCalculatedValue = Math.min(firstCalculatedValue, intermediateResult); // Update the minimum.
            }
        }
    }

    // Third pass: Process the inverted binary string.
    for (let idx = 0; idx < invertedBinaryString.length; idx++) {
        // Look for '1's in the inverted string.
        if (invertedBinaryString[idx] === "1") {
            // Calculate the maximum of two positions related to the current '1'.
            intermediateResult = Math.max(idx + 1, invertedBinaryString.length - idx);

            // Check if there's a '0' immediately after the current '1', or if it's the last character.
            if (idx + 1 < invertedBinaryString.length && invertedBinaryString[idx + 1] === "0") {
                secondCalculatedValue = Math.min(secondCalculatedValue, intermediateResult); // Update the minimum.
            }
            // If the '1' is the very last character in the string.
            else if (idx + 1 === invertedBinaryString.length) {
                secondCalculatedValue = Math.min(secondCalculatedValue, intermediateResult); // Update the minimum.
            }
        }
    }

    // Output the final result: the maximum of the two calculated values, decremented by one.
    console.log(Math.max(firstCalculatedValue, secondCalculatedValue) - 1);
});