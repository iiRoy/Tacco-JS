'use strict';
// This script reads characters from standard input and performs a parity check.

// Utilize the Node.js file system module to read all input.
const charSequence = require("fs").readFileSync("/dev/stdin", "utf8").split("");

// A variable to hold the final decision, initially assuming "Yes".
let parityOutcome = "Yes";

// Iterate through each individual character in the obtained sequence.
for (
    let     mainIndex = 0;
    mainIndex < charSequence.length;
    mainIndex++
) {
    let     frequencyCount = 0; // Initialize a counter for the current character's occurrences.

    // For each character at `mainIndex`, re-iterate through the entire sequence
    // to determine its total occurrences.
    charSequence.forEach( (examinedElement) => {
        if (charSequence[mainIndex] == examinedElement) {
            frequencyCount++; // Increment the counter if a match is found.
        }
    });

    // If the total count of the current character is an odd number,
    // it violates the parity condition.
    if (frequencyCount % 2 !== 0) {
        parityOutcome = "No"; // Set the outcome to "No".
        break; // No need to check further; exit the loop immediately.
    }
}

// Display the final result of the parity check.
console.log(parityOutcome);