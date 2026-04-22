// This module contains a routine to evaluate a specific condition
// based on two distinct numerical inputs provided in a text stream.
'use strict'; // Enforces stricter parsing and error handling in the code.

const evaluateCondition = (incomingRawText) => {
    // Separate the primary line from the entire input data block.
    // We assume inputs are separated by carriage returns.
    const mainInputLine = incomingRawText.split('\r')[0];

    // Extract the first numerical component from the line,
    // assuming components are delimited by hyphens.
    const valueOne = +(mainInputLine.split('-')[0]);
    // Extract the second numerical component.
    const valueTwo = +(mainInputLine.split('-')[1]);

    // Perform the core logical comparison.
    // The condition checks if (valueOne + 1) / 2 is greater than or equal to valueTwo.
    if ((valueOne + 1.0) / 2.0 >= valueTwo) {
        // If the condition holds true, log a positive outcome.
        console.log('AFFIRMATIVE');
    } else {
        // Otherwise, log a negative outcome.
        console.log('NEGATIVE');
    }
};

// Execute the evaluation process by asynchronously reading content
// from a specified file path using Node.js filesystem capabilities.
evaluateCondition(require('node:fs').readFileSync('/var/data/source.txt', 'utf-8'));