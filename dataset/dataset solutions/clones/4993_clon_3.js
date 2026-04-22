'use strict'; // Enforce strict parsing and error handling for robust code execution.

// Obtain access to the necessary file system utilities from Node.js standard library.
const fileSystemAccessModule = require("fs");

// Define the standard input path for reading data, typically pointing to console input.
const standardInputEndpoint = "/dev/stdin";
// Specify the character encoding to interpret the input byte stream as text.
const textEncodingFormat = "utf8";

// Read the entire raw textual content from the designated input source.
// Any leading or trailing whitespace (e.g., newline characters) is removed using `.trim()`.
// The processed content is then fragmented into an array where each element is a single character.
const sourceCharacterSequence = fileSystemAccessModule.readFileSync(standardInputEndpoint, textEncodingFormat).trim().split("");

// Initialize a string variable that will hold the final determination.
// We optimistically assume the condition is met until a counter-example is found.
let finalResultIndicator = "Yes";

// A dynamic data structure (Map) used to efficiently store and retrieve
// the frequency (occurrence count) of each unique character encountered in the input.
const charOccurrenceRegistry = new Map();

// --- Processing Phase 1: Accumulate Character Frequencies ---

// Implement an early exit condition for an empty input sequence.
// If no characters are provided, all character counts are effectively zero (an even number).
// Thus, the condition is satisfied, and we can immediately output "Yes" and terminate.
if (sourceCharacterSequence.length === 0) {
    console.log("Yes");
    process.exit(0); // Terminate the script gracefully with a success code.
}

// Iterate through each individual character present in our prepared input sequence.
for (const currentCharacterElement of sourceCharacterSequence) {
    // Retrieve the current tally for this specific character from the registry.
    // If the character hasn't been seen before, its count defaults to 0.
    const presentTally = charOccurrenceRegistry.get(currentCharacterElement) || 0;
    // Increment the tally and update its corresponding entry in the registry.
    charOccurrenceRegistry.set(currentCharacterElement, presentTally + 1);
}

// --- Processing Phase 2: Evaluate Parity of Frequencies ---

// Introduce a boolean flag to manage the internal logic for frequency parity.
// It's initially set to true, assuming all counts will be even.
let allCountsAreEven = true;

// Iterate over the values (which represent the character counts) stored in our frequency map.
// We only care about the counts themselves for this parity check.
for (const frequencyValue of charOccurrenceRegistry.values()) {
    // Check if the current character's frequency is an odd number.
    // The modulo operator (%) is used to determine if there's a remainder when divided by 2.
    if (frequencyValue % 2 !== 0) {
        allCountsAreEven = false; // If an odd count is found, the overall condition fails.
        break; // Optimization: No need to inspect further counts; the condition is already broken.
    }
}

// --- Output Phase: Deliver the Final Verdict ---

// Based on the state of our boolean flag, set the final string output.
// If 'allCountsAreEven' is false (meaning at least one odd count was found),
// then the final result should be "No".
if (!allCountsAreEven) {
    finalResultIndicator = "No";
}

// Display the determined outcome string to the standard console output.
console.log(finalResultIndicator);