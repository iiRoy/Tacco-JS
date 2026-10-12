"use strict";

// This function processes the input data to reorder a sequence of numbers.
const processInput = (inputData) => {
  // Clean up the input string and split it into lines.
  inputData = inputData.trim().split("\n");

  // The first line contains the total count of elements.
  const totalElements = ~~inputData[0]; // Convert string to integer using bitwise NOT operator.

  // The second line contains space-separated numbers, convert them to an array of integers.
  const inputNumbers = inputData[1].split(" ").map((strValue) => ~~strValue);

  // Initialize an empty array to store the reordered sequence.
  let finalSequence = [];

  // Check if the total number of elements is even or odd.
  if (totalElements % 2 === 0) {
    // Case: Even number of elements.
    // First, iterate backwards from the second-to-last element, taking every other element.
    for (let revEvenIdx = totalElements - 1; revEvenIdx > 0; revEvenIdx -= 2) {
      finalSequence.push(inputNumbers[revEvenIdx]);
    }

    // Then, iterate forwards from the first element, taking every other element.
    for (let fwdEvenIdx = 0; fwdEvenIdx < totalElements; fwdEvenIdx += 2) {
      finalSequence.push(inputNumbers[fwdEvenIdx]);
    }
  } else {
    // Case: Odd number of elements.
    // First, iterate backwards from the last element, taking every other element.
    for (let revOddIdx = totalElements - 1; revOddIdx >= 0; revOddIdx -= 2) {
      finalSequence.push(inputNumbers[revOddIdx]);
    }

    // Then, iterate forwards from the second element, taking every other element.
    for (let fwdOddIdx = 1; fwdOddIdx < totalElements; fwdOddIdx += 2) {
      finalSequence.push(inputNumbers[fwdOddIdx]);
    }
  }

  // Output the final reordered sequence, joined by spaces.
  console.log(finalSequence.join(" "));
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
