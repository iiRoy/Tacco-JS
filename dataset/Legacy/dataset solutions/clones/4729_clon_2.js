"use strict";

// This function serves as the primary entry point for processing input data.
const processInput = (rawData) => {
    // Parse the incoming string data into an integer value.
    const parsedValue = parseInt(rawData);

    // Evaluate the parsed numerical value against a predefined threshold.
    if (parsedValue < 1200) {
        // If the value is less than the threshold, print 'ABC'.
        console.log('ABC');
    } else {
        // Otherwise, if the value is greater than or equal to the threshold, print 'ARC'.
        console.log('ARC');
    }
};

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
