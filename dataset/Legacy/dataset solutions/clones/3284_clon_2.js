"use strict";

// This function processes the raw input data to solve a specific problem.
const ProcessInput = (rawData) => {
  // Split the input string into individual lines and remove any leading/trailing whitespace.
  let inputLines = rawData.trim().split('\n');

  // The first line contains the total number of elements.
  let elementCount = parseInt(inputLines[0], 10);

  // The second line contains two space-separated limits.
  let limitsString = inputLines[1].split(" ");
  let firstLimit = parseInt(limitsString[0], 10); // First threshold value
  let secondLimit = parseInt(limitsString[1], 10); // Second threshold value

  // Initialize three arrays to categorize numbers based on the limits.
  let firstCategory = [];
  let secondCategory = [];
  let thirdCategory = [];

  // The third line contains a list of space-separated numbers.
  // Convert them to integers.
  let allNumbers = inputLines[2].split(' ').map(currentValue => parseInt(currentValue, 10));

  // Iterate through each number and assign it to the appropriate category.
  for (let indexIterator = 0; indexIterator < elementCount; indexIterator++) {
    if (allNumbers[indexIterator] <= firstLimit) {
      firstCategory.push(allNumbers[indexIterator]);
    } else if (allNumbers[indexIterator] <= secondLimit) {
      secondCategory.push(allNumbers[indexIterator]);
    } else {
      thirdCategory.push(allNumbers[indexIterator]);
    }
  }

  // Calculate the minimum length among the three categories.
  let calculatedMinimum = Math.min(firstCategory.length, secondCategory.length, thirdCategory.length);

  // Output the final result to the console.
  console.log(calculatedMinimum);
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
