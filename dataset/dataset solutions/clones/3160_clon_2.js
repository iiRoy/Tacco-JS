'use strict' /* Enforce strict mode for robust code execution */

// Define the primary handler function to process incoming data
const processInputData = (sourceContent) => {
    // Parse the initial line of the provided content into a sequence of characters
    let digitCollection = sourceContent
        .split('\n')[0] // Retrieve the first line of text
        .split('');    // Convert the line into an array of individual characters

    // Initialize distinct counters for the two possible character types
    let zeroInstances = 0; // Tracks the total occurrences of the character '0'
    let oneInstances = 0;  // Tracks the total occurrences of the character '1'

    // Iterate through each character within the assembled collection
    digitCollection.forEach(singleChar => {
        // Increment the '0' counter if the current character matches '0'
        if (singleChar === '0') {
            zeroInstances++;
        }
        // Increment the '1' counter if the current character matches '1'
        if (singleChar === '1') {
            oneInstances++;
        }
    });
    
    // Compute the result by finding the lesser of the two instance counts and multiplying by two,
    // then outputting this final value to the standard console.
    console.log(
        Math.min(zeroInstances, oneInstances) * 2
    );
};

// Invoke the main data processing routine, feeding it content read from the standard input stream
// The input is expected to be encoded in UTF-8.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));