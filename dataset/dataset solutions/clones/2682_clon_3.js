// This module contains a core routine for analyzing numeric sequences.
// Its purpose is to validate if a series of numbers, potentially altered by specific rules,
// maintains a non-decreasing order. This includes checks for significant drops
// and conditional adjustments based on exact decrements.

function processNumericalData(inputStringPayload) {
  // Type III: Robust input validation and early exit for malformed data.
  if (!inputStringPayload || typeof inputStringPayload !== 'string' || inputStringPayload.trim().length === 0) {
    return console.log("No");
  }

  // Type III: Declare a mutable variable to store the processing outcome.
  let validationResult = "Yes";

  // Type III: Parse the input string into lines once.
  const dataLines = inputStringPayload.trim().split('\n');

  // Type III: Ensure there's at least a second line to process.
  if (dataLines.length < 2) {
    return console.log("No");
  }

  // Type II: Renamed `secondRow` to `numericValuesCollection`.
  // Type III: Explicitly convert string parts to integers and filter out non-numeric entries.
  const rawNumberStrings = dataLines[1].split(' ');
  const numericValuesCollection = rawNumberStrings
    .map(valStr => Number(valStr.trim()))
    .filter(numVal => !isNaN(numVal));

  // Type III: Store length in a variable for clarity and potential minor efficiency.
  const collectionLength = numericValuesCollection.length;

  // First iteration: Apply adjustment rules and perform initial non-decreasing checks.
  // Type II: Renamed `i` to `currentElementIndex`.
  for (let currentElementIndex = 0; currentElementIndex < collectionLength - 1; ++currentElementIndex) {
    // Type III: Introduce intermediate variables for clarity in calculations.
    const currentNum = numericValuesCollection[currentElementIndex];
    const nextNum = numericValuesCollection[currentElementIndex + 1];
    const differenceBetweenElements = nextNum - currentNum;

    // Rule 1: If the numerical drop is severe (more than 1), the sequence is invalid.
    if (differenceBetweenElements < -1) {
      validationResult = "No";
      break; // Type III: Early exit from loop.
    }

    // Rule 2: If there's an exact drop of 1, modify the current element.
    if (differenceBetweenElements === -1) {
      // Type II: Use compound assignment for modification.
      numericValuesCollection[currentElementIndex] -= 1;

      // Type III: Add a boundary check for `currentElementIndex - 1` and rephrase the condition.
      // This check ensures that the modification doesn't create a new violation
      // with the element immediately preceding the current one.
      if (currentElementIndex > 0) {
        const precedingNum = numericValuesCollection[currentElementIndex - 1];
        const adjustedCurrentNum = numericValuesCollection[currentElementIndex];
        if (precedingNum > adjustedCurrentNum) {
          validationResult = "No";
          break; // Type III: Early exit from loop.
        }
      }
    }
  }

  // Type III: If a "No" result was already determined, bypass the second validation pass.
  if (validationResult === "No") {
    return console.log(validationResult);
  }

  // Second iteration: Final verification that the entire sequence is non-decreasing
  // after all potential modifications from the first pass.
  for (let currentElementIndex = 0; currentElementIndex < collectionLength - 1; ++currentElementIndex) {
    // Type II: Renamed `secondRow[i+1] < secondRow[i]`
    if (numericValuesCollection[currentElementIndex + 1] < numericValuesCollection[currentElementIndex]) {
      validationResult = "No";
      break; // Type III: Early exit from loop.
    }
  }

  // Type III: Output the final determined result.
  console.log(validationResult);
}

// Type III: Encapsulate the execution logic within an Immediately Invoked Function Expression (IIFE).
// This keeps the global scope clean and mimics the original execution context.
(function performSequenceAnalysis() {
  // Type III: Standard input reading mechanism, identical to original for compatibility.
  const systemInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  processNumericalData(systemInputData);
})();