/*
 * This function processes an input string by repeatedly removing
 * sequences of four or more identical digits (1, 2, or 3).
 * It updates a globally accessible minimum length variable.
 * @param {string} inputStr - The string sequence to be processed.
 */
function processSequence(inputStr) {
    // Stores the length of the string from the previous iteration
    // to detect if any changes occurred.
    let priorLength = 0;

    // Loop until no more sequences of four or more identical digits
    // can be removed from the string.
    while (priorLength !== inputStr.length) {
        // Update the previous length to the current string length
        // before attempting to remove more sequences.
        priorLength = inputStr.length;
        // Remove all occurrences of four or more consecutive 1s, 2s, or 3s.
        // The 'g' flag ensures all matches are replaced, not just the first.
        inputStr = inputStr.replace(/[123]{4,}/g, '');
    }

    // After all possible removals, update the overall minimum length found so far.
    // 'globalMinimum' is expected to be defined in the enclosing scope.
    globalMinimum = Math.min(globalMinimum, inputStr.length);
}

// Read the entire file content from standard input, typically used in competitive programming.
// Using 'node:fs' for a slight variation.
const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
const inputLines = fileContent.trim().split('\n');

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Extract the number of elements for the current test case.
    // The 'shift()' method removes the first element from 'inputLines' and returns it.
    // 'Number()' converts the string to a numeric type.
    const currentCount = Number(inputLines.shift());

    // Termination condition: If the count is 0, exit the loop.
    if (currentCount === 0) {
        break;
    }

    // Initialize an array to store the numeric data for this test case.
    const numberSequence = [];
    // Populate the 'numberSequence' array with 'currentCount' numbers from input.
    for (let loopIdx = 0; loopIdx < currentCount; loopIdx++) {
        // Read and convert each line to a number, then add it to the sequence.
        const currentVal = Number(inputLines.shift());
        numberSequence.push(currentVal);
    }

    // Initialize the minimum length for the current test case to a very large value.
    // This variable will be updated by the 'processSequence' function.
    let globalMinimum = Number.POSITIVE_INFINITY;

    // Convert the initial numeric sequence into a single string for processing.
    const initialStringRepresentation = numberSequence.join('');

    // Iterate through all possible positions in the sequence to apply modifications.
    for (let loopIdx = 0; loopIdx < currentCount; loopIdx++) {
        // Create two copies of the original sequence for different manipulations.
        let modifiedSeqA = numberSequence.slice();
        let modifiedSeqB = numberSequence.slice();

        // Modification A: If not the last element, replace the current element
        // with the value of the next element. This simulates a 'delete and shift left' operation.
        if (loopIdx < currentCount - 1) {
            modifiedSeqA[loopIdx] = modifiedSeqA[loopIdx + 1];
        }

        // Modification B: If not the first element, replace the current element
        // with the value of the previous element. This simulates a 'delete and shift right' operation.
        if (loopIdx > 0) {
            modifiedSeqB[loopIdx] = modifiedSeqB[loopIdx - 1];
        }

        // Process the first modified sequence (A) after joining it into a string.
        processSequence(modifiedSeqA.join(''));
        // Process the second modified sequence (B) after joining it into a string.
        processSequence(modifiedSeqB.join(''));
    }

    // Output the smallest string length found for the current test case.
    console.log(globalMinimum);
}