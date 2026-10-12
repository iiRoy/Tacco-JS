"use strict";

/*
 * This script processes input data to calculate a sequence of numbers.
 * It's designed to handle a specific mathematical transformation.
 */
const processInput = (inputData) => {
  // Clean up the input string and split it into lines
  inputData = inputData.trim().split("\n");

  // Parse the first line as the number of elements
  const countElements = parseInt(inputData[0], 10);

  // Process the second line: split by space, map each part to an integer,
  // and then multiply by two.
  const transformedValues = inputData[1].split(" ").map((numStr) => {
    return parseInt(2 * numStr, 10);
  });

  let cumulativeDifference = 0; // Initialize a variable to accumulate differences

  // Loop through the transformed values to calculate the cumulative difference
  for (let idx = 0; idx < countElements; idx++) {
    cumulativeDifference = transformedValues[idx] - cumulativeDifference;
  }

  // Calculate the initial value for the sequence
  let initialValue = cumulativeDifference / 2;

  let currentElement = initialValue; // Set the first element of the sequence

  let resultArray = []; // Array to store the final sequence of numbers

  // Generate the sequence based on the transformed values and the current element
  for (let indexPos = 0; indexPos < countElements; indexPos++) {
    resultArray.push(currentElement); // Add the current element to the result
    currentElement = transformedValues[indexPos] - currentElement; // Calculate the next element
  }

  // Output the generated sequence, joined by spaces
  console.log(resultArray.join(" "));
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
