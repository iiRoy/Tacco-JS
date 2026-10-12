"use strict";

// This function processes the given input data.
const processInputData = (inputLines) => {
    // Extract the first line of input, which is expected to be a string.
    let inputString = inputLines[0];
    // Initialize a flag to indicate if a specific pattern is found.
    let matchFound;

    // Check for the first pattern: AABB where A != B
    if (inputString[0] === inputString[1] && inputString[2] === inputString[3] && inputString[0] !== inputString[2]) {
        matchFound = 1; // Set flag if pattern matches
    }

    // Check for the second pattern: ABAB where A != B
    if (inputString[0] === inputString[2] && inputString[1] === inputString[3] && inputString[0] !== inputString[1]) {
        matchFound = 1; // Set flag if pattern matches
    }

    // Check for the third pattern: ABBA where A != B
    if (inputString[0] === inputString[3] && inputString[1] === inputString[2] && inputString[0] !== inputString[1]) {
        matchFound = 1; // Set flag if pattern matches
    }

    // Output 'Yes' if any pattern was found (matchFound is 1), otherwise 'No'.
    console.log(matchFound === 1 ? 'Yes' : 'No');
};

// Read input from standard input, decode as UTF-8, split by newlines, and pass to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
