"use strict";

// This script processes input to extract characters at regular intervals.
const processInput = (inputData) => {
  // Trim leading/trailing whitespace and split the input into lines.
  inputData = inputData.trim().split("\n");

  // The first line contains the string to be processed.
  const charArray = inputData[0].split("");

  // The second line contains the step size (integer).
  const stepSize = parseInt(inputData[1], 10); // Explicitly specify radix 10

  // Initialize an array to store the extracted characters.
  let resultChars = [];

  // Iterate over the indices of the character array.
  for (let idx in charArray) {
    // Check if the current index is a multiple of the step size.
    // The unary plus operator converts 'idx' from string to number for the modulo operation.
    if (+idx % stepSize === 0) {
      // If it is, add the character at this index to our result array.
      resultChars.push(charArray[idx]);
    }
  }

  // Join the collected characters into a single string and print it to the console.
  console.log(resultChars.join(""));
};

// Read the input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
