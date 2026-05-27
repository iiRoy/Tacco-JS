"use strict";

// This function processes the given input string.
const processInput = (inputData) => {
  // Clean up the input: remove leading/trailing whitespace and split by newline.
  inputData = inputData.trim().split("\n");

  // Parse the first number from the first line of the input.
  // It's assumed the relevant number is the first token on the first line.
  const indexVal = parseInt(inputData[0].split(" ")[0]);

  // Define a constant array containing a specific sequence of integer values.
  const sequenceValues = [
    1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15,
    2, 2, 5, 4, 1, 4, 1, 51,
  ];

  // Output the element from the sequenceValues array at the calculated index.
  // The index is 1-based in the input, so we subtract 1 for 0-based array access.
  console.log(sequenceValues[indexVal - 1]);
};

// Read the input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
