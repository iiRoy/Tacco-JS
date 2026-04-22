// This JavaScript module enforces strict parsing and execution rules.
'use strict';

// Import the Node.js file system module, aliasing it for brevity.
const sysIO = require("fs");

// Define a constant for the standard input file path, enhancing readability and maintainability.
const standardInputEndpoint = "/dev/stdin";

/**
 * Determines if every unique character within a given sequence appears an even number of times.
 * This analysis considers character frequency parity.
 *
 * @param {string[]} charSequenceElements - An array where each element is a single character.
 * @returns {string} "Yes" if all character counts are even; otherwise, "No".
 */
function assessCharacterFrequencyParity(charSequenceElements) {
    // Pre-validation: If the input sequence is null, undefined, or empty,
    // the condition is vacuously met as there are no characters with odd counts.
    if (!charSequenceElements || charSequenceElements.length === 0) {
        return "Yes";
    }

    // A Map data structure is employed to efficiently store and retrieve
    // the occurrence count for each distinct character encountered.
    const characterTallyMap = new Map();

    // First pass: Populate the frequency map.
    // Iterate over each character in the input array to compute its total occurrences.
    for (const individualCharacter of charSequenceElements) {
        // Increment the count for the current character. If the character is encountered
        // for the first time, its count is initialized to zero before incrementing.
        characterTallyMap.set(individualCharacter, (characterTallyMap.get(individualCharacter) || 0) + 1);
    }

    // Initialize a boolean flag to track the overall parity compliance.
    let allFrequenciesAreEven = true;

    // Second pass: Evaluate the parity of each character's frequency.
    // Iterate through the values (counts) stored in the character frequency map.
    for (const frequencyCount of characterTallyMap.values()) {
        // Check if the current character's count is odd.
        // An odd count violates the condition immediately.
        if (frequencyCount % 2 !== 0) {
            allFrequenciesAreEven = false; // Mark that an odd frequency was found.
            break; // Terminate further checks as the condition is already failed.
        }
    }

    // Return the final verdict based on the flag's state.
    return allFrequenciesAreEven ? "Yes" : "No";
}

// Entry point for script execution.
try {
    // Attempt to synchronously read the raw byte data from the standard input path.
    const rawInputBuffer = sysIO.readFileSync(standardInputEndpoint);

    // Convert the raw buffer data into a UTF-8 encoded string, then split it
    // into an array of single characters for processing.
    const processedCharacterArray = rawInputBuffer.toString('utf8').split('');

    // Invoke the character parity assessment function with the prepared input.
    const finalVerdictString = assessCharacterFrequencyParity(processedCharacterArray);

    // Output the conclusive result to the standard output stream.
    console.log(finalVerdictString);

} catch (processingIssue) {
    // Catch and handle any errors that may occur during file system operations or data processing.
    console.error("An operational error was detected during input processing:", processingIssue.message);
    // Exit the process with a non-zero status code to indicate an abnormal termination.
    process.exit(1);
}