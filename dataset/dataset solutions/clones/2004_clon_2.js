"use strict";

// This function orchestrates the primary logic of the application.
const executeProgram = inputDataString => {
  // First, we process the raw input string by trimming whitespace
  // and splitting it into an array of lines.
  const processedLinesArray = inputDataString.trim().split("\n");

  // Extract the first numerical parameter from the first line.
  const firstParam = Number(processedLinesArray[0].split(" ")[0]);
  // Obtain the second numerical parameter from the same initial line.
  const secondParam = Number(processedLinesArray[0].split(" ")[1]);

  // Parse the second line into an array of numbers.
  const numericCollection = processedLinesArray[1].split(" ").map(strValue => Number(strValue));

  // Calculate the sum of all elements within the numeric collection.
  const overallSum = numericCollection.reduce((currentSum, elementValue) => currentSum + elementValue);

  // Determine the minimum required value based on the total sum and the second parameter.
  const minimumRequiredValue = overallSum / (4 * secondParam);

  // Sort the numeric collection in descending order.
  numericCollection.sort().reverse();

  // Iterate through a subset of the sorted collection.
  for (let loopIndex = 0; loopIndex < secondParam; loopIndex++) {
    // Check if any of the top 'secondParam' values fall below the calculated threshold.
    if (numericCollection[loopIndex] < minimumRequiredValue) {
      // If a value is below the threshold, print "No" and terminate execution.
      console.log("No");
      return;
    }
  }

  // If all top 'secondParam' values meet or exceed the threshold, print "Yes".
  console.log("Yes");
};

// Initiate the program by reading input from standard input.
executeProgram(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);