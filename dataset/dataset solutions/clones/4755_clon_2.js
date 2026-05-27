let inputData = require('fs').readFileSync('/dev/stdin', 'utf8')
    .split('\n')[0]
    .split(' '); // Read the first line from stdin and split it by spaces.

// Extract and convert the four numerical values from the input array.
let valOne = inputData.shift() * 1; // First value
let valTwo = inputData.shift() * 1; // Second value
let valThree = inputData.shift() * 1; // Third value
let valFour = inputData.shift() * 1; // Fourth value

// Perform a conditional calculation based on the values and print the result.
// If (valOne * valTwo) is greater than (valTwo * valThree), output (valOne * valTwo).
// Otherwise, output (valThree * valFour).
console.log(valOne * valTwo > valTwo * valThree ? valOne * valTwo : valThree * valFour);
