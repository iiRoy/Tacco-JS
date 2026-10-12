"use strict";

const processInput = (rawInputString) => {
  // Split the raw input string into individual lines after trimming whitespace
  const inputLines = rawInputString.trim().split("\n");

  // Parse the first line for the number of elements (N), though it's not used in the core logic
  const arrayLength = parseInt(inputLines[0], 10);
  
  // Parse the second line to get the array of numbers
  const stringNumbers = inputLines[1].split(" ");
  const numericArray = stringNumbers.map(str => parseInt(str, 10));

  // Calculate the sum of all elements in the array using a traditional loop
  let overallArraySum = 0;
  for (let k = 0; k < numericArray.length; k++) {
    overallArraySum += numericArray[k];
  }

  // Initialize two accumulators based on the first element of the array
  // These accumulators are updated in a specific way to match the original algorithm's behavior
  let currentLeftAccumulator = numericArray[0];
  let currentRightAccumulator = overallArraySum - numericArray[0];
  
  // Initialize the minimum difference found to a very large value
  let minimumDifferenceFound = Infinity;
  
  // Iterate through each element of the array to calculate and update differences
  // The loop runs for each element, from index 0 to length-1
  for (let elementIndex = 0; elementIndex < numericArray.length; elementIndex++) {
    // Store the current element in a temporary variable for clarity
    const currentElementValue = numericArray[elementIndex];

    // Calculate the absolute difference between the current accumulator values
    const calculatedDifference = Math.abs(currentRightAccumulator - currentLeftAccumulator);
    
    // Update the overall minimum difference if the current difference is smaller
    minimumDifferenceFound = Math.min(minimumDifferenceFound, calculatedDifference);
    
    // Update the accumulators for the next iteration
    // This specific update pattern is critical for preserving the original behavior
    currentRightAccumulator -= currentElementValue;
    currentLeftAccumulator += currentElementValue;
  }
  
  // Output the final minimum difference
  console.log(minimumDifferenceFound);
};

// Read input from stdin and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
