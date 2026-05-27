"use strict";

// This function processes the given raw input data.
function ProcessInput(rawData) {
    // Split the entire input into individual lines.
    let textRows = rawData.split('\n');

    // Extract the first element from the first line after splitting by whitespace.
    let firstLineVal = textRows.shift().split(/\s/)[0];

    // Convert the extracted string value to a numeric type.
    let currentNum = Number(firstLineVal);

    // Initialize an empty string to build the result.
    let resultString = '';

    // Loop as long as the current number is not zero.
    while (currentNum !== 0) {
        // Check if the current number is odd.
        if (currentNum % 2 !== 0) {
            // If odd, decrement the number and prepend '1' to the result.
            currentNum--;
            resultString = '1' + resultString;
        } else {
            // If even, prepend '0' to the result.
            resultString = '0' + resultString;
        }
        // Divide the current number by -2 for the next iteration.
        currentNum /= -2;
    }

    // If the result string is still empty after the loop, set it to '0'.
    if (resultString === '') {
        resultString = '0';
    }

    // Output the final computed result to the console.
    console.log(resultString);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
