"use strict";

// Establish a connection to the standard input stream
process.stdin.resume();
// Set the character encoding for incoming data to UTF-8
process.stdin.setEncoding('utf8');

// A buffer to hold all lines read from standard input until the stream closes
let bufferedInputLines = [];

// Create an interface for interacting with the console input/output
const ioStreamHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Output stream is not explicitly used for writing in this script, but required by interface
});

// Register an event listener to capture each line as it's received
ioStreamHandler.on('line', (currentInputSegment) => {
  bufferedInputLines.push(currentInputSegment);
});

/**
 * Utility function to safely retrieve and clean the next available line from the input buffer.
 * It removes the first element from `bufferedInputLines` and trims whitespace.
 * @returns {string | undefined} The trimmed string of the next line, or undefined if the buffer is empty.
 */
function getNextInputSegment() {
    // Attempt to extract the leading line from our collected input segments
    const nextSegment = bufferedInputLines.shift();
    // Return the extracted segment after trimming any leading/trailing whitespace, if it exists
    return nextSegment ? nextSegment.trim() : undefined;
}


// Register an event listener to be triggered once the entire input stream has ended
ioStreamHandler.on('close', () => {

    // This loop continuously processes blocks of input until a specific termination signal is encountered
    for (;;) {

        // Retrieve the primary string data for the current processing cycle
        let stringToProcess = getNextInputSegment();

        // Check if the current string represents the termination condition
        if (stringToProcess === "-") {
            break; // Exit the infinite loop if the termination signal is found
        }

        // Perform a basic validation to ensure we have a valid string to operate on
        if (!stringToProcess) {
            // If no valid string is present (e.g., an unexpected empty line before the terminator),
            // log a warning and proceed to the next iteration to avoid errors.
            console.warn("Warning: Received an empty or invalid string for processing. Skipping this block.");
            continue;
        }

        // Transform the input string into an array of individual characters for manipulation
        let characterList = stringToProcess.split('');

        // Read the string representation of the total number of rotation operations planned
        const numRotationsStr = getNextInputSegment();
        let numRotations = Number(numRotationsStr); // Convert to a numeric value

        // Validate the number of rotations to ensure it's a non-negative integer
        if (isNaN(numRotations) || numRotations < 0) {
            console.error(`Error: Invalid or negative number of rotations received: '${numRotationsStr}'. Skipping current input block.`);
            continue; // Abort processing this block due to invalid input
        }

        // Initialize an array to store the specific shift amounts for each rotation
        let rotationParameters = [];

        // Loop to collect each individual rotation parameter
        for (let k = 0; k < numRotations; ++k) {
            const shiftValStr = getNextInputSegment(); // Get the string form of the shift value
            const shiftVal = Number(shiftValStr);       // Convert it to a number

            // Validate each individual shift value
            if (isNaN(shiftVal)) {
                console.error(`Error: Invalid shift value '${shiftValStr}' for rotation ${k + 1}. Skipping current input block.`);
                // Consume any remaining expected inputs for this block to clear the buffer for the next block
                for (let j = k + 1; j < numRotations; ++j) {
                    getNextInputSegment();
                }
                rotationParameters = []; // Clear collected parameters as this block is invalid
                break; // Exit the inner loop and implicitly skip processing this block
            }
            rotationParameters.push(shiftVal); // Add the valid shift value to our collection
        }

        // If 'rotationParameters' is empty but 'numRotations' was positive, it means validation failed.
        // In this case, we skip the rest of the processing for this block.
        if (rotationParameters.length === 0 && numRotations > 0) {
            continue;
        }

        // Invoke the core function to apply all specified cyclic shifts to the character list
        const finalCharacterSequence = performArrayRotation(characterList, rotationParameters);

        // Output the final, rotated character sequence, joined back into a single string
        console.log(finalCharacterSequence.join(''));
    }
});

/**
 * Executes a series of cyclic shift (rotation) operations on an array of characters.
 * Each operation takes a specified number of elements from the beginning of the array
 * and re-positions them at its end.
 *
 * @param {Array<string>} inputArray - The initial array of characters that will undergo rotations.
 * @param {Array<number>} rotationSpecs - An ordered list of integers, where each integer denotes
 *                                       the number of elements to shift for a single rotation.
 * @returns {Array<string>} The character array after all specified rotations have been applied.
 */
function performArrayRotation(inputArray, rotationSpecs) {

    // Create a shallow copy of the input array to ensure we don't modify the original
    // array passed into this function, promoting immutability where possible.
    let currentArrayState = [...inputArray];

    // Iterate through the list of rotation specifications
    while (rotationSpecs.length > 0) {
        // Retrieve the next raw shift amount from the beginning of the specifications list
        const rawShiftAmount = rotationSpecs.shift();

        // Implement a guard clause to handle any invalid shift amounts (e.g., null, undefined, NaN)
        if (rawShiftAmount === undefined || rawShiftAmount === null || isNaN(rawShiftAmount)) {
            console.warn("Warning: An invalid (non-numeric or missing) shift amount was encountered. Skipping this specific rotation operation.");
            continue; // Skip the current invalid shift and proceed to the next one
        }

        // Calculate the effective shift amount. This handles cases where the shift
        // is larger than the array's length (using modulo) and ensures the shift
        // is non-negative (as per typical cyclic shift interpretation in this context).
        const effectiveShiftAmount = Math.max(0, rawShiftAmount % currentArrayState.length);

        // If the array is empty, or if the effective shift amount is zero,
        // no rotation is necessary for this step, so we can skip it.
        if (currentArrayState.length === 0 || effectiveShiftAmount === 0) {
            continue;
        }

        // Perform the actual cyclic shift using array slicing and concatenation:
        // 1. Extract the elements that need to be moved from the beginning.
        const elementsToRelocate = currentArrayState.slice(0, effectiveShiftAmount);
        // 2. Obtain the remaining elements that stay in their relative order.
        const remainingElements = currentArrayState.slice(effectiveShiftAmount);
        // 3. Concatenate the remaining elements with the relocated elements to form the new array state.
        currentArrayState = remainingElements.concat(elementsToRelocate);
    }

    // Return the final state of the character array after all rotations are complete
    return currentArrayState;
}