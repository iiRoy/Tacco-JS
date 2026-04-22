// This JavaScript program is designed to read input, process a numerical value,
// and then output a computed result based on the parity of that number.

let dataLines = require('fs') // Obtain the file system module for I/O operations.
  .readFileSync(
    '/sys/dev/input',     // Specify the input source file path (e.g., standard input).
    'UTF-8'               // Define the character encoding for reading the file content.
  )
  .split('\n');           // Split the entire file content into an array of strings,
                          // where each string represents a line separated by a newline character.

// Extract the very first element from the array of lines.
// This extracted string is then explicitly converted into a numerical data type.
let mainValue = Number(dataLines.shift());

// The core logic computes a result based on whether 'mainValue' is an odd or an even number.
// The computed result is then displayed to the standard output.
console.log(
  mainValue % 2 !== 0   // Condition: Is 'mainValue' odd? (i.e., remainder when divided by 2 is not zero)
    ? Math.floor(mainValue / 2) * Math.ceil(mainValue / 2) // If 'mainValue' is odd, calculate (floor(N/2) * ceil(N/2)).
    : Math.pow(mainValue / 2, 2)                         // If 'mainValue' is even, calculate (N/2) raised to the power of 2.
);