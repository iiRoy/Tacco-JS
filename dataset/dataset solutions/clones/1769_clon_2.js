const rawData = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n'); // Read input from standard input, decode as UTF-8, and split by newline characters.

// Parse the first line of input to extract two numerical values.
// The values are space-separated, so we split the string and convert each part to a number.
const [firstVal, secondVal] = rawData[0].split(' ').map(Number);

// Initialize a string variable to hold the final answer.
// Default assumption is 'No'.
let resultString = 'No';

// Check if the first value is strictly less than the second value.
// This is a primary condition for further processing.
if (firstVal < secondVal) {
  // Calculate an intermediate value based on the two input numbers.
  // This calculation is part of the core algorithm.
  const remainderCalc = (secondVal - firstVal * 2) / 2;

  // If the calculated intermediate value is less than or equal to the first input value,
  // then the condition is met, and the answer becomes 'Yes'.
  if (remainderCalc <= firstVal) {
    resultString = 'Yes';
  }
}

// Output the final determined answer to the console.
console.log(resultString);
