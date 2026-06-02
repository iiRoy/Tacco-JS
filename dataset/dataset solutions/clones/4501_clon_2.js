"use strict";

/*
 * This module processes a string of numbers to determine a specific outcome.
 * It's designed to handle input from standard input.
 */
const ProcessInput = (rawData) => {
    // Parse the input string into an array of integers.
    // The input is expected to be space-separated numbers.
    let parsedNumbers = rawData.trim().split(' ').map(currentVal => parseInt(currentVal, 10));

    let resultMessage = ''; // Initialize the output message.

    // Evaluate conditions based on the parsed numeric values.
    if (parsedNumbers[1] >= parsedNumbers[2]) {
        resultMessage = 'delicious'; // Condition 1: Second number is greater than or equal to third.
    } else if (parsedNumbers[0] + 1 < (parsedNumbers[2] - parsedNumbers[1])) {
        resultMessage = 'dangerous'; // Condition 2: First number plus one is less than the difference of third and second.
    } else if (parsedNumbers[0] + 1 > (parsedNumbers[2] - parsedNumbers[1])) {
        resultMessage = 'safe'; // Condition 3: First number plus one is greater than the difference of third and second.
    }
    // Output the determined message to the console.
    console.log(resultMessage);
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
