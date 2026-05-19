'use strict';

// This function processes the raw input data to determine if a specific geometric condition is met.
function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const inputLines = rawData.split('\n');

  // Parse the first line to get the number of elements (though not directly used in the logic, it's part of the input spec).
  const countOfElements = parseInt(inputLines[0]);

  // Process the second line:
  // 1. Split it by spaces to get individual string representations of numbers.
  // 2. Convert each string to a numeric type.
  // 3. Sort the resulting array of numbers in ascending order.
  const numericValues = inputLines[1]
    .split(' ')
    .map(Number)
    .sort((firstVal, secondVal) => firstVal - secondVal); // Standard ascending sort

  // Extract the largest value from the sorted array.
  // The `pop()` method removes the last element (which is the largest after sorting) and returns it.
  const largestValue = numericValues.pop();

  // Calculate the sum of the remaining elements in the array.
  // The `reduce()` method iterates over the array and accumulates a single result.
  const totalSum = numericValues.reduce((accumulator, currentElement, currentIndex, originalArray) => accumulator + currentElement);

  // Compare the largest value with the sum of the other values.
  // If the largest value is strictly less than the sum of the others, print "Yes", otherwise print "No".
  console.log(largestValue < totalSum ? 'Yes' : 'No');
}

// Read the input from standard input and pass it to the processing function.
// This assumes the script is run in an environment where /dev/stdin is available (e.g., Linux/macOS).
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
