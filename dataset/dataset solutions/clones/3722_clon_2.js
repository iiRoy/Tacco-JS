"use strict"

function analyzeNumber(dataString) {
    // Obtain the primary numerical value from the received string data.
    let initialValue = Number(dataString.split('\n')[0]);
    // Create a temporary variable to manipulate for digit extraction.
    let currentRemainder = initialValue;
    // Initialize a variable to accumulate the sum of individual digits.
    let digitSumTotal = 0;

    // Iterate a number of times equivalent to the length of the input string.
    for (let digitIndex = 1; digitIndex <= dataString.length; digitIndex++) {
        // Add the last digit of the current remainder to the running total.
        digitSumTotal += currentRemainder % 10; // Extracts the rightmost digit.
        // Remove the last digit from the current remainder.
        currentRemainder = Math.floor(currentRemainder / 10); // Shifts digits to the right.
        // An alternative approach could be:
        // currentRemainder = (currentRemainder - (currentRemainder % 10)) / 10;
    }

    // Determine if the original number is perfectly divisible by its digit sum.
    if (initialValue % digitSumTotal === 0) {
        console.log('Yes'); // Output affirmation if divisible.
    } else {
        console.log('No'); // Output negation if not divisible.
    }
}

// Execute the number analysis function, reading content from standard input.
analyzeNumber(require('fs').readFileSync('/dev/stdin', 'utf8'));