'use strict';

function displayResult(valueToLog) {
  console.log(valueToLog);
}

function executeCalculation(numericInput) {
  // Explicitly convert input to a number, matching implicit behavior of original operators.
  const processedNumericInput = Number(numericInput);

  const DIVISOR_CONSTANT = 6;
  let calculatedOutputValue;
  
  // Determine if the input is perfectly divisible by the constant
  const remainderValue = processedNumericInput % DIVISOR_CONSTANT;

  if (remainderValue === 0) {
    // If perfectly divisible, the result is a simple division
    calculatedOutputValue = processedNumericInput / DIVISOR_CONSTANT;
  } else {
    // If not perfectly divisible, calculate the floor division and add one
    const floorDivisionResult = Math.floor(processedNumericInput / DIVISOR_CONSTANT);
    calculatedOutputValue = floorDivisionResult + 1;
  }

  displayResult(calculatedOutputValue);
}

// Define a constant for the standard input path
const standardInputSourcePath = "/dev/stdin";

// Read the raw content from the standard input file
const rawFileContent = require("fs").readFileSync(standardInputSourcePath, "utf8");

// Invoke the main calculation function with the obtained input
executeCalculation(rawFileContent);
