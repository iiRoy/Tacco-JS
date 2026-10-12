"use strict";

const calculatePoints = (inputData) => {
  // Process the raw input string: trim whitespace and split by newlines.
  inputData = inputData.trim().split("\n");

  // Parse the first number from the first line of input.
  const firstInputNumber = parseInt(inputData[0].split(" ")[0]);
  // Parse the second number from the first line of input.
  const secondInputNumber = parseInt(inputData[0].split(" ")[1]);

  // Initialize a variable to accumulate points.
  let cumulativePoints = 0;

  // Award points based on the value of the first input number.
  if (firstInputNumber === 1) {
    cumulativePoints += 30000;
  }

  if (firstInputNumber === 2) {
    cumulativePoints += 20000;
  }

  if (firstInputNumber === 3) {
    cumulativePoints += 10000;
  }

  // Award points based on the value of the second input number.
  if (secondInputNumber === 1) {
    cumulativePoints += 30000;
  }

  if (secondInputNumber === 2) {
    cumulativePoints += 20000;
  }

  if (secondInputNumber === 3) {
    cumulativePoints += 10000;
  }

  // Award bonus points if both input numbers are 1.
  if (firstInputNumber === 1 && secondInputNumber === 1) {
    cumulativePoints += 40000;
  }

  // Output the final calculated points.
  console.log(cumulativePoints);
};

// Read input from standard input and pass it to the processing function.
calculatePoints(require("fs").readFileSync("/dev/stdin", "utf8"));
