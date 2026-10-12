'use strict';

function ProcessInput(rawData) {
    // Extract the primary numeric value from the initial line of input.
    const targetValue = Number(rawData.trim().split('\n')[0]);
    console.log(targetValue);

    // Define a collection of single digits that are considered invalid for the last position.
    const forbiddenDigits = [0, 2, 4, 5, 6, 8];

    // Iterate through each digit in the set of disallowed values.
    for (const forbiddenDigit of forbiddenDigits) {
        // Check if the final digit of the target number matches any of the forbidden digits.
        if (targetValue % 10 === forbiddenDigit) {
            console.log('-1'); // Output a specific error indicator.
            return; // Terminate the function's execution immediately.
        }
    }

    // The original code contained a commented-out section here, which is omitted as it's non-executable.
    // This part of the function would continue if no forbidden digits were found.
    return; // Explicitly conclude the function's operation.
}

// Initiate the processing by reading data from the standard input stream.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
