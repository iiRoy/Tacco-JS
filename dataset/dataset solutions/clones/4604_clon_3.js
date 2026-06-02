"use strict";

// Helper function to parse input values from a string
function parseNumericInputs(inputStringData) {
  const partsArray = inputStringData.split(" ");
  // Using map for parsing each part to an integer, then destructuring
  const [valueOne, valueTwo, valueThree] = partsArray.map(item => parseInt(item, 10));
  return { valueOne, valueTwo, valueThree };
}

// Main processing function for the input data
function processInputData(rawInputContent) {
  // Extract and rename the input numbers using the helper function and destructuring
  const { valueOne: firstOperand, valueTwo: modulusValue, valueThree: targetRemainder } = parseNumericInputs(rawInputContent);

  // Pre-calculate the initial modulo for the first number to simplify the loop
  const adjustedFirstOperand = firstOperand % modulusValue;

  let isConditionMet = false; // Renamed flag variable
  const iterationCountLimit = modulusValue; // Helper constant for loop boundary

  // Loop through possible multipliers
  for (let currentMultiplier = 0; currentMultiplier < iterationCountLimit; currentMultiplier++) {
    // Introduce intermediate computation steps
    const productBeforeModulo = adjustedFirstOperand * currentMultiplier;
    const currentCalculatedRemainder = productBeforeModulo % modulusValue;

    // Check if the current remainder matches the target
    if (currentCalculatedRemainder === targetRemainder) {
      isConditionMet = true;
      break; // Exit loop early if condition is met
    }
  }

  // Output the result based on whether the condition was met
  if (isConditionMet) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

// This line should not be edited (standard input/output handling)
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
