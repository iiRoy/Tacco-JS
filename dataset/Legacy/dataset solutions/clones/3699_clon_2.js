'use strict';

/*
 * This function processes raw input data to calculate the difference
 * between the maximum and minimum values in a sequence of numbers.
 */
function ProcessInputData(sourceData) {
  // Extract the first line to determine the count of items, though not directly used in calculation.
  const itemCount = Number(sourceData.split('\n')[0]);

  // Parse the second line, splitting by space and converting each part to a number.
  const numberArray = sourceData.split('\n')[1].split(' ').map(currentNum => Number(currentNum));

  // Find the largest value within the array using Math.max.
  const maximumElement = Math.max.apply(null, numberArray);

  // Find the smallest value within the array using Math.min.
  const minimumElement = Math.min.apply(null, numberArray);

  // Output the computed range (difference between max and min) to the console.
  console.log(maximumElement - minimumElement);
}

// Execute the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
