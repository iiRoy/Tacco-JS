const rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read raw input from standard input.

// Convert the raw string data into an integer, removing any spaces.
const parsedValue = parseInt(rawData.replace(' ', ''), 10);

/*
 * Calculate the square root of the numerical value.
 * This will be used to determine if the original number was a perfect square.
 */
const rootResult = Math.sqrt(parsedValue);

// Output 'Yes' if the square root is an integer, otherwise output 'No'.
console.log(Number.isInteger(rootResult) ? 'Yes' : 'No');
