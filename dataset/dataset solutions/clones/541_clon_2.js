// This particular script is crafted to process a pair of numerical inputs.
// It expects a single line from standard input, containing two integral values separated by a space.

// Import the necessary module for file system operations,
// which is utilized here to simulate reading from standard input.
const inputStreamHandle = require('fs');

                                                // Retrieve all raw text from the standard input source.
// In typical competitive programming contexts, this often maps to /dev/stdin.
let rawInputText = inputStreamHandle
  .readFileSync('/dev/stdin', 'utf8') // Read the content as UTF-8.
  .trim(); // Remove any leading/trailing whitespace.

// Deconstruct the acquired input string into an array of string segments,
// using the space character as the primary delimiter.
let numericTokens = rawInputText.split(' ');

// Convert the very first segment of the token array into an integer.
// This will serve as the divisor in our subsequent computation.
const firstDivisor = parseInt(numericTokens[0], 10);

// Convert the second segment of the token array into an integer.
// This will serve as the dividend in our subsequent computation.
const secondDividend = parseInt(numericTokens[1], 10);

// Execute the core calculation: perform floor division of the dividend by the divisor,
// and then increment the resulting integer quotient by one.
let finalQuotient = Math.floor(secondDividend / firstDivisor) + 1;

// Emit the ultimate computed integer value to the standard output channel.
console.log(finalQuotient);