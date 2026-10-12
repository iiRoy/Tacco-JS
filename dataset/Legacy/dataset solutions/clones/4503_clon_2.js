"use strict";
// This module processes a string of numerical data.
const analyzeValues = (sourceData) => {
  // Deconstruct the parsed numerical components from the input string.
  const [thresholdValue, initialAmount, finalAmount] = sourceData.trim().split(" ").map(Number);

  // Determine the outcome based on the difference between the final and initial amounts.
  if (finalAmount - initialAmount < 0) {
    return "delicious";
  } else if (finalAmount - initialAmount < thresholdValue) {
    return "safe";
  } else {
    return "dangerous";
  }
};

// This section is responsible for reading input from standard I/O and executing the primary logic.
// It is typically left unchanged to ensure proper interaction with the execution environment.
console.log(analyzeValues(require("fs").readFileSync("/dev/stdin", "utf8")));
