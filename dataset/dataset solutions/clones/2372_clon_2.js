"use strict";

// This script processes a numerical input to determine a specific condition.
const processInputData = (inputContent) => {
  // Clean up the input string and split it into lines.
  inputContent = inputContent.trim().split("\n");

  // Extract the primary numeric value from the first line.
  const targetNumber = inputContent[0];

  // If the target number is less than 100, a specific outcome is guaranteed.
  if (targetNumber < 100) {
    console.log(0); // Output zero for values below the threshold.
    return; // Exit the function early.
  }

  // The core logic involves manipulating the last two digits (tens and units place).
  // First, extract the last two digits of the number.
  let currentTensValue = parseInt(targetNumber.split("").slice(-2).join(""));
  // Store the original value of these last two digits for later comparison.
  let initialTensPart = currentTensValue;
  // Initialize a counter for the reduction operations.
  let reductionSteps = 0;

  // Handle special cases for the extracted two-digit value.
  if (currentTensValue === 0) {
    console.log(1); // If the last two digits are 0, output one.
    return; // Terminate execution.
  }

  // Another specific case for a two-digit value of 1.
  if (currentTensValue === 1) {
    reductionSteps = currentTensValue; // The step count is simply 1.
  }

  // Perform a series of subtractions to reduce the two-digit value to zero.
  // This loop simulates a greedy reduction process.
  while (currentTensValue !== 0) {
    if (currentTensValue >= 5) {
      currentTensValue = currentTensValue - 5; // Subtract 5 if possible.
    } else if (currentTensValue >= 4) {
      currentTensValue = currentTensValue - 4; // Subtract 4 if 5 is not possible.
    } else if (currentTensValue >= 3) {
      currentTensValue = currentTensValue - 3; // Subtract 3 if 4 is not possible.
    } else if (currentTensValue >= 2) {
      currentTensValue = currentTensValue - 2; // Subtract 2 if 3 is not possible.
    } else if (currentTensValue >= 1) {
      currentTensValue = currentTensValue - 1; // Subtract 1 as a last resort.
    }
    reductionSteps++; // Increment the counter for each operation.
  }

  // After reducing the tens value, check the final condition.
  // The condition involves multiplying the step count by 100 and adding the original two-digit part.
  // This result is then compared against the original target number.
  if (100 * reductionSteps + initialTensPart <= targetNumber) {
    console.log(1); // Output one if the condition holds true.
  } else {
    console.log(0); // Otherwise, output zero.
  }
};

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
