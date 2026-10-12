"use strict";

// This script processes a list of numbers to determine medians and
// then outputs a transformed list based on those medians.

/**
 * Main function to handle the input data and perform calculations.
 * @param {string} inputData - The raw input string from stdin.
 */
const processInput = (inputData) => {
  // Clean up the input string: remove leading/trailing whitespace and split into lines.
  inputData = inputData.trim().split("\n");

  // Parse the first line to get the count of elements.
  // The problem statement implies N is the first number on the first line.
  const countElements = parseInt(inputData[0].split(" ")[0]);

  // Parse the second line to get the array of numbers.
  // Each number string is converted to an integer.
  const originalArray = inputData[1].split(" ").map((numStr) => parseInt(numStr));

  // Create a sorted copy of the original array to find medians.
  // The spread operator `...` creates a shallow copy before sorting.
  const orderedElements = [...originalArray].sort((a, b) => a - b);

  // Calculate the two medians for an even-sized array.
  // For an array of N elements, the medians are at indices (N/2 - 1) and (N/2).
  const lowerMedian = orderedElements[countElements / 2 - 1];
  const upperMedian = orderedElements[countElements / 2];

  // Initialize an empty array to store the transformed results.
  let resultList = [];

  // Iterate through the original array using a for...in loop.
  // This loop processes each element based on its comparison with the medians.
  for (let idx in originalArray) {
    // If the current element from the original array is less than the upper median,
    // push the upper median to the result list.
    if (originalArray[idx] < upperMedian) {
      resultList.push(upperMedian);
    }
    // Otherwise (if the current element is greater than or equal to the upper median),
    // push the lower median to the result list.
    else {
      resultList.push(lowerMedian);
    }
  }

  // Join the elements of the result list with newline characters and print to console.
  console.log(resultList.join("\n"));
};

// Read the entire content of standard input synchronously and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
