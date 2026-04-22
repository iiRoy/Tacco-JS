"use strict";

function processInput(inputString) {
    // Parse the numerical upper bound from the input data.
    const limitNumber = parseInt(inputString.split("\n")[0].split(" ")[0], 10);
    // Calculate the number of digits in the upper bound.
    const limitDigits = String(limitNumber).length;
    let totalMatches = 0; // Initialize a counter for found patterns.

    // Iterate through all numbers from one up to, but not including, the limit.
    for (let currentNum = 1; currentNum < limitNumber; currentNum++) {
        // Obtain the first and last digits of the current number.
        const numEnds = getEnds(currentNum);
        // Determine the digit count of the current number.
        const currentDigits = String(currentNum).length;

        // Loop through potential lengths for the suffix part of the combined number.
        for (let numLength = 1; numLength <= limitDigits; numLength++) {
            // Scenario where the base number is a single digit.
            if (currentDigits === 1) {
                // If the suffix is also a single digit.
                if (numLength === 1) {
                    totalMatches++; // Increment for simple matches (e.g., 1, 1).
                }
                // If the suffix is two digits long.
                if (numLength === 2 && numEnds[0] === numEnds[1]) {
                    totalMatches++; // Increment for two-digit suffix matches (e.g., 1, 11).
                }
                // If the suffix has more than two digits.
                if (numLength > 2 && numEnds[0] === numEnds[1]) {
                    // Generate numbers by inserting varying middle digits.
                    for (let middleDigit = 0; ; middleDigit++) {
                        const formedNum = Number(`${currentNum}${middleDigit}${currentNum}`);
                        if (formedNum > limitNumber) break; // Stop if the generated number exceeds the limit.
                        totalMatches++; // Increment for complex multi-digit suffix matches.
                    }
                }
            }
            // Scenario where the base number has multiple digits.
            if (currentDigits > 1) {
                // If the suffix is a single digit.
                if (numLength === 1) {
                    if (numEnds[0] === numEnds[1]) // Ensure the first and last digits of the base match.
                        totalMatches++; // Increment for single-digit suffix.
                }
                // If the suffix is two digits long.
                if (numLength === 2) {
                    if (numEnds[0] === numEnds[1]) // Ensure the first and last digits of the base match.
                        totalMatches++; // Increment for two-digit suffix.
                }
                // If the suffix has more than two digits.
                if (numLength > 2) {
                    // Generate numbers by inserting varying middle digits.
                    for (let middleDigit = 0; ; middleDigit++) {
                        const formedNum = Number(`${numEnds[1]}${middleDigit}${numEnds[0]}`);
                        if (formedNum > limitNumber) break; // Stop if the generated number exceeds the limit.
                        totalMatches++; // Increment for complex multi-digit suffix.
                    }
                }
            }
        }
    }
    console.log(totalMatches); // Output the final tally of matching patterns.
}

// Function to extract the first and last digits of a number.
function getEnds(val) {
    const valStr = String(val); // Convert the input numerical value to its string representation.
    const valLen = valStr.length; // Get the total length of the string.

    if (valLen === 1) {
        // For numbers with a single digit, both the first and last digits are identical.
        return [parseInt(valStr, 10), parseInt(valStr, 10)];
    }
    if (valLen > 1) {
        // For numbers with multiple digits, return the first character and the last character as numbers.
        return [parseInt(valStr[0], 10), parseInt(valStr[valLen - 1], 10)];
    }
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));