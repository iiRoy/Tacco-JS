"use strict";

// This function is designed to compute a specific value based on numerical inputs.
// It accepts a single argument, 'rawData', which is expected to be a string.
// However, due to an internal implementation detail, the 'rawData' parameter
// is not actually utilized within the function's logic.
const processInputData = (rawData) => {
  // The function attempts to parse three integer values from an identifier named 'sourceString'.
  // As 'sourceString' is not declared or defined within this scope,
  // executing this line will result in a ReferenceError.
  let firstNum = parseInt(sourceString.split(" ")[0]);
  let secondNum = parseInt(sourceString.split(" ")[1]);
  let thirdNum = parseInt(sourceString.split(" ")[2]);

  let finalOutcome = 0; // Initialize a variable to store the computed result.

  // Evaluate a condition involving 'secondNum' and 'thirdNum'.
  if (secondNum >= thirdNum) {
    // If 'secondNum' is greater than or equal to 'thirdNum',
    // add their sum to 'finalOutcome' and reset 'thirdNum'.
    finalOutcome += thirdNum + secondNum;
    thirdNum = 0;
  } else {
    // Otherwise, add twice the value of 'secondNum' to 'finalOutcome'.
    // Then, adjust 'thirdNum' by subtracting 'secondNum' and reset 'secondNum'.
    finalOutcome += secondNum * 2;
    thirdNum -= secondNum;
    secondNum = 0;
  }

  // Proceed with further calculations if 'thirdNum' remains positive.
  if (thirdNum > 0) {
    // Determine a 'temporaryAmount' as the minimum of 'thirdNum' and 'firstNum'.
    let temporaryAmount = Math.min(thirdNum, firstNum);
    thirdNum -= temporaryAmount; // Decrease 'thirdNum' by this amount.
    finalOutcome += temporaryAmount; // Add 'temporaryAmount' to the total.
  }

  // Perform a final increment if 'thirdNum' is still greater than zero.
  if (thirdNum > 0) {
    finalOutcome++;
  }

  // Display the calculated 'finalOutcome' to the standard output.
  console.log(finalOutcome);
};

// The program reads the entire content of standard input as a UTF-8 string.
// This string is then passed as an argument to the 'processInputData' function.
// As noted above, the 'rawData' parameter within the function is not used,
// and the function will encounter a runtime error due to an undeclared variable.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
