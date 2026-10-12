var inputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var numericValue = parseInt(inputData); // Convert the input string to an integer

// Calculate the first part of the result: thousands based on multiples of 500
var finalResult = Math.floor(numericValue / 500) * 1000;

// Calculate the second part of the result: fives based on the remainder after dividing by 500
finalResult += Math.floor((numericValue % 500) / 5) * 5;

console.log(finalResult); // Output the computed final result to the console
