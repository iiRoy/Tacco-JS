"use strict";

// Helper function to apply an arithmetic operation based on the operator character
const performOperation = (currentValue, operatorChar, operand) => {
  if (operatorChar === "+") {
    return currentValue + operand;
  } else if (operatorChar === "-") {
    return currentValue - operand;
  }
  // Should not be reached with the given operator set
  return currentValue;
};

function processInput(rawData) {
  const TARGET_SUM_VALUE = 7;

  // Step 1: Convert raw string input into an array of character digits
  const charDigits = rawData.split("");
  // Step 2: Map character digits to their numeric values
  const numericValues = charDigits.map(digitChar => Number(digitChar));

  // Define all possible combinations of three binary operators
  const operatorCombinations = [
    ["+", "+", "+"],
    ["+", "+", "-"],
    ["+", "-", "-"],
    ["-", "-", "+"],
    ["-", "+", "-"],
    ["+", "-", "+"],
    ["-", "+", "+"],
    ["-", "-", "-"]
  ];

  // Iterate through each operator combination
  for (let comboIndex = 0; comboIndex < operatorCombinations.length; comboIndex++) {
    let currentResult = numericValues[0];
    // Initialize an array to build the expression string parts
    let expressionParts = [String(numericValues[0])];

    // Apply the first operator and update result and expression string
    const opChar1 = operatorCombinations[comboIndex][0];
    currentResult = performOperation(currentResult, opChar1, numericValues[1]);
    expressionParts.push(opChar1, String(numericValues[1]));

    // Apply the second operator and update result and expression string
    const opChar2 = operatorCombinations[comboIndex][1];
    currentResult = performOperation(currentResult, opChar2, numericValues[2]);
    expressionParts.push(opChar2, String(numericValues[2]));

    // Apply the third operator and update result and expression string
    const opChar3 = operatorCombinations[comboIndex][2];
    currentResult = performOperation(currentResult, opChar3, numericValues[3]);
    expressionParts.push(opChar3, String(numericValues[3]));

    // Check if the calculated sum matches the target value
    if (currentResult === TARGET_SUM_VALUE) {
      // If it matches, print the full expression and exit
      console.log(expressionParts.join("") + "=" + TARGET_SUM_VALUE);
      return false; // Indicate that a solution was found
    }
  }
}

// Read input from stdin and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
