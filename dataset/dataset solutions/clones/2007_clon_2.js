const rawData = require("fs")
  .readFileSync("/dev/stdin", "utf8"); // Obtain raw input data from standard input

const dataRows = rawData.split('\n'); // Divide the raw data into an array of individual lines

// Extract the first two numerical values from the initial line
const [firstNum, secondNum] = dataRows[0]
  .split(' ')
  .map(Number); // Convert string representations to actual numbers

// Display the parsed numbers to the console
console.log(firstNum, secondNum);

// Compute the remainder when the first number is divided by the second number
let resultVal = firstNum % secondNum;

// Adjust the result to be the minimum of the current remainder and its absolute difference from the second number
resultVal = Math.min(resultVal, Math.abs(resultVal - secondNum));

// Output the final calculated value
console.log(resultVal);
