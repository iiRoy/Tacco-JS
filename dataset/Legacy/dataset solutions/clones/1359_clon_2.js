"use strict";

// This script reads two numbers from standard input and compares them.
var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input string by space to get individual number strings.
var parsedNumbers = inputData.split(" ");

// Assign the first and second values.
var firstVal = parsedNumbers[0];
var secondVal = parsedNumbers[1];

// Perform the comparison logic.
if (firstVal == secondVal) {
    console.log('a == b'); // Output if values are equal.
} else if (firstVal > secondVal) {
    console.log('a > b'); // Output if the first value is greater.
} else {
    console.log('a < b'); // Output if the second value is greater.
}
