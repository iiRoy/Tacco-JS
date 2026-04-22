"use strict";

// This function serves as the primary entry point for processing textual data.
const processInputData = ( sourceText ) => {
    // Divide the incoming string into an array of individual rows, using the newline character as a delimiter.
    const textRows = sourceText.split("\n");

    // Evaluate the length of the very first row.
    if (textRows[0].length === 1) {
        // If the initial row contains only one character, output a specific numeric constant.
        console.log('9');
        // Immediately exit the function in this particular scenario.
        return;
    }

    // Determine an adjusted length based on the character count of the first row.
    const adjustedLength = textRows[0].length - 1;

    // Parse the first character of the first row into an integer, then decrement it by one.
    const firstCharValue = parseInt(textRows[0][0]) - 1;

    // Calculate and display the final outcome using the derived numerical components.
    console.log(firstCharValue + adjustedLength * 9);
};

// Initiate the data processing by reading content from standard input,
// ensuring it's interpreted as UTF-8 encoded text.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));