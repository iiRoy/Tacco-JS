"use strict";

// Function to compute permutations (nPr)
const calculateArrangement = (totalItems, selectedItems) => {
  let resultValue = 1; // Initialize the product

  // Loop to multiply 'totalItems' by (totalItems - 1) ... (totalItems - selectedItems + 1)
  for (let loopIndex = 0; loopIndex < selectedItems; loopIndex++) {
    resultValue *= totalItems - loopIndex;
  }

  return resultValue; // Return the calculated permutation
};

// Function to compute combinations (nCr)
const determineSelection = (totalItems, selectedItems) => {
  // Combinations are permutations divided by permutations of the selected items themselves
  return calculateArrangement(totalItems, selectedItems) / calculateArrangement(selectedItems, selectedItems);
};

// Main processing function
const processInputData = (inputString) => {
  // Clean and parse the input string
  inputString = inputString.trim().split("\n");
  const firstNumber = parseInt(inputString[0]); // The first number N (not used in this specific logic, but parsed)
  const dataArray = inputString[1]
    .split(" ")
    .map((numStr) => parseInt(numStr))
    .sort((valA, valB) => valB - valA); // Parse numbers, then sort in descending order

  // Calculate the target value, which is half of the largest element
  let halfValue = dataArray[0] / 2;
  let minimumDifference = Infinity; // Initialize minimum difference to a very large number
  let closestElement; // Variable to store the element closest to 'halfValue'

  // Iterate through the sorted array to find the element closest to 'halfValue'
  for (let arrayIndex in dataArray) {
    const absoluteDifference = Math.abs(halfValue - dataArray[arrayIndex]); // Calculate absolute difference

    // If current difference is smaller than the recorded minimum difference
    if (absoluteDifference < minimumDifference) {
      closestElement = dataArray[arrayIndex]; // Update the closest element
      minimumDifference = absoluteDifference; // Update the minimum difference
    }
  }

  // Output the largest element and the element closest to its half
  console.log(dataArray[0] + " " + closestElement);
};

// Execute the main function with input read from standard input
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
