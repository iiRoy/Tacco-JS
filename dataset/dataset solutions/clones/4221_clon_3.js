"use strict";

// Helper utility to apply a numeric operator sign to an operand.
// A positive sign (1) implies addition, a negative sign (-1) implies subtraction.
function applyNumericOperation(operandValue, operatorSignMultiplier) {
  return operandValue * operatorSignMultiplier;
}

// Core function to find an arithmetic expression that sums to a specific target.
function discoverTargetSumExpression(inputNumericSequence) {
  // Enforce strict input requirements: a 4-character string.
  if (typeof inputNumericSequence !== 'string' || inputNumericSequence.length !== 4) {
    console.error("Error: The provided input must be a string of exactly four digits.");
    return null; // Signal an invalid input condition.
  }

  // Transform the input string into an array of integer components.
  const numericalComponents = inputNumericSequence.split("").map(charUnit => {
    const parsedInt = parseInt(charUnit, 10);
    // Validate that each character successfully converted to a number.
    if (isNaN(parsedInt)) {
      console.error(`Error: Non-numeric character '${charUnit}' detected in the input sequence.`);
      return NaN; // Mark as invalid to be caught later.
    }
    return parsedInt;
  });

  // If any character was not a digit, terminate early.
  if (numericalComponents.some(Number.isNaN)) {
    return null; // Indicate failure due to malformed input.
  }

  // The specific sum we aim to achieve.
  const desiredFinalSum = 7;

  // Predefined combinations of operator signs (1 for '+', -1 for '-').
  // This array represents all 2^3 = 8 possible arrangements for three binary operators.
  const operatorSignMatrix = [
    [1, 1, 1],    // first set of operators: + + +
    [1, 1, -1],   // second set: + + -
    [1, -1, -1],  // third set: + - -
    [-1, -1, 1],  // fourth set: - - +
    [-1, 1, -1],  // fifth set: - + -
    [1, -1, 1],   // sixth set: + - +
    [-1, 1, 1],   // seventh set: - + +
    [-1, -1, -1]  // eighth set: - - -
  ];

  // Iterate through each possible operator combination.
  for (let patternIndex = 0; patternIndex < operatorSignMatrix.length; ++patternIndex) {
    let accumulatedValue = numericalComponents[0]; // Initialize with the initial digit.
    const currentPatternSigns = operatorSignMatrix[patternIndex]; // Fetch current operator signs.

    // Apply the first operator to the second digit.
    accumulatedValue += applyNumericOperation(numericalComponents[1], currentPatternSigns[0]);
    // Apply the second operator to the third digit.
    accumulatedValue += applyNumericOperation(numericalComponents[2], currentPatternSigns[1]);
    // Apply the third operator to the fourth digit.
    accumulatedValue += applyNumericOperation(numericalComponents[3], currentPatternSigns[2]);

    // Check if this combination results in the desired sum.
    if (accumulatedValue === desiredFinalSum) {
      // If a match is found, construct and display the resulting equation string.
      let constructedEquation = `${numericalComponents[0]}`;
      constructedEquation += (currentPatternSigns[0] === 1 ? '+' : '-') + `${numericalComponents[1]}`;
      constructedEquation += (currentPatternSigns[1] === 1 ? '+' : '-') + `${numericalComponents[2]}`;
      constructedEquation += (currentPatternSigns[2] === 1 ? '+' : '-') + `${numericalComponents[3]}`;
      constructedEquation += `=${desiredFinalSum}`;

      console.log(constructedEquation); // Output the successful equation.
      return constructedEquation; // Return the found string and exit.
    }
  }

  // If the loop completes without finding any combination, return null.
  return null; // Indicates no solution was discovered for the input.
}

// Entry point for execution, typically used in a Node.js environment.
// Reads input from standard input, processes it, and prints the result.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
discoverTargetSumExpression(rawInputContent);