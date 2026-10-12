"use strict";

const processInput = (rawText) => {
  // Clean up the input string and split it by newlines
  rawText = rawText.trim().split("\n");

  // Extract the first line as the primary numeric input
  const numericInput = rawText[0];

  // If the input value is less than 100, output 0 and exit
  if (numericInput < 100) {
    console.log(0);
    return;
  }

  // The goal is to determine if a certain condition is met based on the last two digits.
  // First, isolate the last two digits of the number.
  let lastTwoDigits = parseInt(numericInput.split("").slice(-2).join(""));
  let operationCount = 0; // Counter for operations

  // If the last two digits are 0, output 1 and exit immediately.
  if (lastTwoDigits === 0) {
    console.log(1);
    return;
  }

  // Special handling for the case where the last two digits are 1.
  // This sets an initial count before the main loop.
  if (lastTwoDigits === 1) {
    operationCount = lastTwoDigits;
  }

  // Loop until the last two digits become zero through modulo operations.
  while (lastTwoDigits !== 0) {
    if (lastTwoDigits >= 5) {
      lastTwoDigits = lastTwoDigits % 5;
    } else if (lastTwoDigits >= 4) {
      lastTwoDigits = lastTwoDigits % 4;
    } else if (lastTwoDigits >= 3) {
      lastTwoDigits = lastTwoDigits % 3;
    } else if (lastTwoDigits >= 2) {
      lastTwoDigits = lastTwoDigits % 2;
    } else if (lastTwoDigits >= 1) {
      lastTwoDigits = lastTwoDigits % 1;
    }
    operationCount++; // Increment the counter for each operation
  }

  // console.log("Count of operations:" + operationCount); // Debugging line, kept as comment

  // Compare the calculated value with the original input.
  // Output 1 if 100 times the operation count is less than the numeric input, otherwise output 0.
  if (100 * operationCount < numericInput) {
    console.log(1);
  } else {
    console.log(0);
  }
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
