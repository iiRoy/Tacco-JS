'use strict';

const processData = (rawDataString) => {
    // Extract the maximum allowed value for each variable from the input string.
    const upperLimit = parseInt(rawDataString.split(' ')[0]);

    // Extract the desired total sum from the input string.
    const targetValue = parseInt(rawDataString.split(' ')[1]);

    let matchCount = 0; // Initialize a counter for combinations that meet the criteria.

    // Loop through all possible integer values for the first term, from 0 up to upperLimit.
    for (let firstTerm = 0; firstTerm <= upperLimit; firstTerm++) {
        // For each firstTerm, loop through all possible integer values for the second term.
        for (let secondTerm = 0; secondTerm <= upperLimit; secondTerm++) {
            // For each pair of firstTerm and secondTerm, loop through all possible integer values for the third term.
            for (let thirdTerm = 0; thirdTerm <= upperLimit; thirdTerm++) {
                // Check if the sum of the three terms equals the targetValue.
                if (firstTerm + secondTerm + thirdTerm === targetValue) {
                    matchCount++; // If the condition is met, increment the counter.
                }
            }
        }
    }

    // Print the final count of valid combinations to the console.
    console.log(matchCount);
};

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, invoke the data processing function with the obtained string.
processData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
