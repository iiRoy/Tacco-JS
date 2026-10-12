inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'); // Read input from standard input, split by newlines

let lineParts = inputData.shift().split(' '); // Get the first line of input and split it by spaces

let firstNumber = lineParts[0] * 1; // Convert the first part to a number
let secondNumber = lineParts[1] * 1; // Convert the second part to a number

// Calculate the ceiling of the average of the two numbers and print it
console.log(Math.ceil((firstNumber + secondNumber) / 2));
