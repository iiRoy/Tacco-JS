'use strict';

const ProcessInput = (inputString) => {
  // Remove leading/trailing whitespace and divide the input into separate lines.
  let linesArray = inputString.trim().split('\n');

  // Extract the first number from the first line of input.
  let firstVal = linesArray[0].split(' ').map(Number)[0];

  // Extract the second number from the first line of input.
  let secondVal = linesArray[0].split(' ').map(Number)[1];

  // Perform a weighted sum calculation.
  let totalSum = 3 * firstVal + secondVal;

  // Calculate the final outcome by dividing the sum by two and rounding down.
  let finalResult = Math.floor(totalSum / 2);

  // Display the computed result.
  console.log(finalResult);
};

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
