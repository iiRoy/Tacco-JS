'use strict';

// This function processes the provided raw string data.
const processData = (rawData) => {
    // The first line of the input is taken and split into an array of individual characters.
    let charSequence = rawData.split('\n')[0].split('');

    // Initialize counters for the occurrences of '0' and '1' characters.
    let zeroOccurrences = 0;
    let oneOccurrences = 0;

    // Iterate through each character in the sequence to tally the counts.
    charSequence.forEach(charItem => {
        if (charItem === '0') {
            zeroOccurrences++; // Increment the counter for '0's.
        }
        if (charItem === '1') {
            oneOccurrences++; // Increment the counter for '1's.
        }
    });

    // The final result is twice the minimum of the two character counts.
    console.log(Math.min(zeroOccurrences, oneOccurrences) * 2);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
