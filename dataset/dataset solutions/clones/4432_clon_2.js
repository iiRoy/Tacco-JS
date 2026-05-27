let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' '); // Read input from stdin and process it

let firstVal = inputData.shift() * 1; // Extract the first number and convert to integer
let secondVal = inputData.shift() * 1; // Extract the second number and convert to integer

// Calculate the product of (firstVal - 1) and (secondVal - 1) and print it
console.log((firstVal - 1) * (secondVal - 1));
