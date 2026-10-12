"use strict";

// Resume standard input stream processing
process.stdin.resume();
// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding('utf8');

// Array to store all lines read from standard input
let inputDataRows = [];

// Create an interface for reading lines from standard input
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line received from standard input
inputProcessor.on('line', (receivedLineContent) => {
  // Add the received line to our buffer
  inputDataRows.push(receivedLineContent);
});

// Event listener for when the input stream closes
inputProcessor.on('close', () => {
    // Main processing loop
    while (true) {
        // Get the next line from the buffer and remove leading/trailing whitespace
        const currentProcessedLine = inputDataRows.shift().trim();

        // Check for termination condition
        if (currentProcessedLine === "-") {
            break; // Exit the loop if the termination signal is found
        }

        // Convert the current line into an array of characters
        const initialCharArr = currentProcessedLine.split('');
        // Read the number of shift operations from the next line
        const numberOfShifts = Number(inputDataRows.shift());

        // Array to store the shift values
        let shiftOperations = [];
        // Populate the shift operations array
        for (let operationIndex = 0; operationIndex < numberOfShifts; operationIndex++) {
            shiftOperations.push(Number(inputDataRows.shift()));
        }

        // Execute the string rotations and print the result
        console.log(executeStringRotations(initialCharArr, shiftOperations).join(''));
    }
});

/**
 * Performs a series of left rotations on a character array.
 * @param {Array<string>} characterSequence - The array of characters to rotate.
 * @param {Array<number>} rotationSteps - An array of integer values, each representing a left shift amount.
 * @returns {Array<string>} The character array after all rotations have been applied.
 */
function executeStringRotations(characterSequence, rotationSteps) {
    // Determine the total length of the character sequence
    const sequenceTotalLength = characterSequence.length;

    // Iterate while there are rotation steps remaining
    while (rotationSteps.length > 0) {
        // Get the next rotation value from the beginning of the array
        let currentRotationValue = rotationSteps.shift();

        // Perform the left rotation:
        // Take the part from currentRotationValue to the end,
        // then concatenate it with the part from the beginning up to currentRotationValue.
        characterSequence = characterSequence.slice(currentRotationValue, sequenceTotalLength)
                                            .concat(characterSequence.slice(0, currentRotationValue));
    }

    // Return the final rotated character sequence
    return characterSequence;
}
