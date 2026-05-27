const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// This utility function checks if an item is present in a collection.
const containsElement = (collection, item) => {
  if (collection.indexOf(item) >= 0) {
    return true; // The item was found.
  } else {
    return false; // The item was not found.
  }
};

// Split the raw input data into two distinct lines.
const firstLineData = rawData.split('\n')[0];
const secondLineData = rawData.split('\n')[1];

// Parse the first line to extract two numerical parameters.
const numElements = Number(firstLineData.split(' ')[0]);
const maxSelections = Number(firstLineData.split(' ')[1]);

// Convert the second line into an array of numbers.
const numericValues = secondLineData.split(' ').map(idx => Number(idx));

// Sort the array of numbers in ascending order.
const orderedValues = numericValues.sort((valA, valB) => valA - valB);

// Initialize an array to store differences between consecutive sorted numbers.
let differenceList = [];

// Populate the differenceList with (maxSelections - 1) differences.
for (let loopIndex = 0; loopIndex < maxSelections - 1; loopIndex++) {
  differenceList.push(orderedValues[loopIndex + 1] - orderedValues[loopIndex]);
}

// Sort the array of differences in ascending order.
const orderedDifferences = differenceList.sort((valX, valY) => valX - valY);

// Extract the largest differences, excluding the smallest ones.
const largestDifferences = orderedDifferences.slice(maxSelections - numElements);

let finalResult; // Declare the result variable with broader scope.

// Calculate the final result based on whether there are any largest differences.
if (largestDifferences.length !== 0) {
  // Sum up the values in the largestDifferences array.
  let sumOfLargestDifferences = largestDifferences.reduce((previousSum, currentNum) => {
    return previousSum + currentNum;
  });

  // Calculate the final result: (max_original - min_original) - sum_of_largest_differences.
  finalResult = Math.max.apply(null, numericValues) - Math.min.apply(null, numericValues) - sumOfLargestDifferences;
} else {
  // If there are no differences to consider, the result is zero.
  finalResult = 0;
}

// Function to display the computed result.
const displayResult = () => {
  // If the number of elements to select is greater than or equal to the total available selections,
  // the cost is 0.
  if (numElements >= maxSelections) {
    console.log(0);
    return;
  }
  // Otherwise, print the calculated final result.
  console.log(finalResult);
  return;
};

// Execute the display function to output the answer.
displayResult();
