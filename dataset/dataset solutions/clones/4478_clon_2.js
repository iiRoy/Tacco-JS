"use strict";

// This function serves as the primary entry point for processing input data.
const processInput = (inputString) => {
  // Trim leading/trailing whitespace and split the input into individual lines.
  let inputLines = inputString.trim().split("\n");

  // The first line contains the number of elements (N), but it's not used in the logic.
  const numElements = parseInt(inputLines[0]);

  // The second line contains space-separated numbers, parse them into an array of integers.
  const dataArray = inputLines[1].split(" ").map((itemStr) => parseInt(itemStr));

  // Calculate the sum of all elements in the array.
  const overallTotal = dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);

  // Initialize the sum of the left partition with the first element.
  let leftPartitionSum = dataArray[0];
  // Initialize the sum of the right partition with the total sum minus the first element.
  let rightPartitionSum = overallTotal - dataArray[0];

  // Initialize the minimum difference found so far to a very large number.
  let minDifference = Infinity;

  // Iterate through the array to find the optimal split point.
  // Note: The loop iterates one element past the last valid split point to calculate the final difference.
  for (let currentIndex in dataArray) {
    // Calculate the absolute difference between the current left and right partition sums.
    let currentDifference = Math.abs(rightPartitionSum - leftPartitionSum);

    // Update the minimum difference if the current difference is smaller.
    minDifference = Math.min(minDifference, currentDifference);

    // If there's a next element, update the partition sums for the next iteration.
    // The `parseInt(currentIndex) + 1` handles the string key from `for...in`.
    if (parseInt(currentIndex) + 1 < dataArray.length) {
      rightPartitionSum -= dataArray[parseInt(currentIndex) + 1];
      leftPartitionSum += dataArray[parseInt(currentIndex) + 1];
    }
  }

  // Output the smallest absolute difference found.
  console.log(minDifference);
};

// Read the input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
