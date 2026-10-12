"use strict";

// This function processes the raw input string to determine a comparison result.
const ProcessInput = (rawData) => {
    // Split the input into lines and trim whitespace from each line.
    let lines = rawData.trim().split('\n');

    // Parse the first line into an array of integers (digits).
    let firstNumDigits = lines[0].trim().split('').map(digitChar => parseInt(digitChar, 10));
    // Parse the second line into an array of integers (digits).
    let secondNumDigits = lines[1].trim().split('').map(digitChar => parseInt(digitChar, 10));

    // Get the length of the first digit array.
    let firstLen = firstNumDigits.length;
    // Get the length of the second digit array.
    let secondLen = secondNumDigits.length;

    // Initialize a variable to store the sum of digits for the first number.
    let sumFirstDigits = 0;
    // Loop through the digits of the first number and accumulate their sum.
    for (let idx = 0; idx < firstLen; idx++) {
        sumFirstDigits += firstNumDigits[idx];
    }

    // Initialize a variable to store the sum of digits for the second number.
    let sumSecondDigits = 0;
    // Loop through the digits of the second number and accumulate their sum.
    for (let idx = 0; idx < secondLen; idx++) {
        sumSecondDigits += secondNumDigits[idx];
    }

    // Compare the calculated sums and print the appropriate result.
    if (sumFirstDigits > sumSecondDigits) {
        console.log('GREATER'); // Output if the first sum is larger.
    } else {
        console.log('LESS');    // Output if the second sum is larger or equal.
    }
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
