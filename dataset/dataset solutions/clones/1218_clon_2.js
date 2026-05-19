let inputData = require('fs').readFileSync('/dev/stdin', 'UTF-8'); // Read input from standard input
const firstValue = Number(inputData.split(' ')[0]); // Parse the first number
const secondValue = Number(inputData.split(' ')[1]); // Parse the second number
const thirdValue = Number(inputData.split(' ')[2]); // Parse the third number

// Check if the numbers are in strictly increasing order
if (firstValue < secondValue && secondValue < thirdValue) {
  console.log('Yes'); // Output 'Yes' if the condition is met
} else {
  console.log('No'); // Otherwise, output 'No'
}
;
