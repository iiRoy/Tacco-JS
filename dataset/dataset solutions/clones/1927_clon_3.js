'use strict';

// A utility function to output results to the console.
const displayResult = (outputValue) => {
  console.log(outputValue);
};

// This function processes the input data and computes the maximum value of a specific expression.
function calculateMaxExpressionValue(inputSourceLines) {
  // --- Input Validation and Parsing (Type III Additions) ---
  if (!Array.isArray(inputSourceLines) || inputSourceLines.length === 0) {
    displayResult("Error: No input data provided. Exiting.");
    return;
  }

  const firstLineData = inputSourceLines[0];
  const parameterStrings = firstLineData.split(" ");

  if (parameterStrings.length < 3) {
      displayResult("Error: Insufficient numerical parameters in input. Expected 3 values.");
      return;
  }

  // Explicitly parse the numerical parameters (Type II: Data Type Change, Type III: Destructuring)
  const [alphaCoeffString, betaDivisorString, iterationLimitString] = parameterStrings;

  const alphaCoeff = Number(alphaCoeffString); // Renamed A
  const betaDivisor = Number(betaDivisorString); // Renamed B
  const iterationLimit = Number(iterationLimitString); // Renamed N

  // Further input validation (Type III Additions)
  if (isNaN(alphaCoeff) || isNaN(betaDivisor) || isNaN(iterationLimit)) {
      displayResult("Error: One or more input parameters are not valid numbers. Aborting calculation.");
      return;
  }
  if (betaDivisor === 0) {
      displayResult("Error: The divisor (betaDivisor) cannot be zero to prevent division by zero errors.");
      return;
  }
  if (iterationLimit < 1) {
      displayResult("Warning: The iteration limit is less than 1. The maximum value will be 0 as no iterations occur.");
      displayResult(0); // If N < 1, the loop won't run, resulting in a max of 0.
      return;
  }

  // Initialize a variable to store the highest value found during computation (Type II: Renamed identifier)
  let currentPeakValue = 0;

  // --- Core Calculation Loop (Type III: Loop structure and expression breakdown) ---
  // Using a while loop instead of a for loop (Type III Update)
  let loopCounter = 1; // Renamed i for clarity
  while (loopCounter <= iterationLimit) {
    // Breaking down the expression into intermediate steps for readability (Type III Additions)
    const productAlphaCounter = alphaCoeff * loopCounter;
    const firstTermResult = Math.floor(productAlphaCounter / betaDivisor);

    const counterOverBeta = loopCounter / betaDivisor;
    const floorCounterOverBeta = Math.floor(counterOverBeta);
    const secondTermProduct = alphaCoeff * floorCounterOverBeta;

    // Calculate the current value for this iteration (Type II: Renamed identifier)
    const computedResult = firstTermResult - secondTermProduct;

    // Update the maximum value if the current result is greater (Type III Update: Using Math.max)
    currentPeakValue = Math.max(currentPeakValue, computedResult);

    // Increment the counter for the next iteration
    loopCounter++;
  }

  // --- Output Final Result ---
  // Display the highest computed value found across all iterations.
  displayResult(currentPeakValue);
}

// --- Standard Input/Output Handling (Do Not Modify) ---
// This part of the code reads the input from standard input and passes it to the main processing function.
// It should remain as is to ensure compatibility with typical competitive programming environments.
calculateMaxExpressionValue(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));