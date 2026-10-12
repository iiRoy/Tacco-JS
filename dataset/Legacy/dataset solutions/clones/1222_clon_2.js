'use strict';

// Encapsulate the entire script within an Immediately Invoked Function Expression (IIFE)
(function(inputDataBuffer) {
    // Convert the input buffer (from stdin) into a string
    var rawInputString = inputDataBuffer.toString();

    // Process the first line of the input:
    // 1. Split by newline to get an array of lines.
    // 2. Take the first line (index 0).
    // 3. Split that line by space to get an array of string numbers.
    // 4. Map each string number to an actual Number type.
    var parsedNumericValues = rawInputString.split('\n')[0].split(' ').map(Number);

    // Extract the three numbers into distinct variables
    var firstValue = parsedNumericValues[0];
    var secondValue = parsedNumericValues[1];
    var thirdValue = parsedNumericValues[2];

    // Declare variables to hold the smallest, a potential middle, and the largest value
    var minimumValue, candidateMiddleValue, maximumValue;

    // Find the smallest value among the three using Math.min
    minimumValue = Math.min(firstValue, secondValue, thirdValue);

    // Find the largest value among the three using Math.max
    maximumValue = Math.max(firstValue, secondValue, thirdValue);

    // The following conditional blocks determine the 'candidateMiddleValue'.
    // This logic directly replicates the original's behavior, which means
    // 'candidateMiddleValue' might not always represent the true middle value
    // and could even remain undefined if none of the conditions are met.
    if (firstValue < secondValue) {
        candidateMiddleValue = firstValue;
    }
    if (secondValue < thirdValue) {
        candidateMiddleValue = secondValue;
    }
    if (firstValue <= thirdValue) {
        candidateMiddleValue = thirdValue;
    }

    // Output the determined minimum, candidate middle, and maximum values to the console
    console.log(minimumValue, candidateMiddleValue, maximumValue);

// The IIFE is immediately invoked, passing the content of '/dev/stdin'
// as a UTF-8 string, read synchronously using Node.js 'fs' module.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
