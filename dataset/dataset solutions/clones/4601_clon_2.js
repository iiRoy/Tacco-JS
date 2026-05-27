'use strict';

function processInput(inputString) {
  // Parse the input string into an array of numbers.
  // The first line is taken, split by space, and each part converted to a number.
  let numericValues = inputString.split('\n')[0].split(' ').map(function(strVal) {
    return Number(strVal);
  });

  // Extract the three primary numeric values.
  const firstNum = numericValues[0];
  const secondNum = numericValues[1];
  const targetNum = numericValues[2];

  // Initialize a collection to store unique modulo results.
  let remainderCollection = new Set();

  // Iterate from 0 up to (firstNum * secondNum) inclusive.
  // Calculate (firstNum * current_iteration_value) % secondNum and add to the collection.
  for (let counter = 0; counter <= firstNum * secondNum; counter++) {
    remainderCollection.add((firstNum * counter) % secondNum);
  }

  // Determine if the target number is present in the collection of remainders.
  const resultMessage = remainderCollection.has(targetNum) ? 'YES' : 'NO';

  // Output the final determination.
  console.log(resultMessage);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
