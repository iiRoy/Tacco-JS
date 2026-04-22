"use strict";

// This module provides a function to analyze a set of numerical parameters
// and determine an outcome category based on their relationships.
// The primary goal is to assess a 'state' relative to an 'origin' and a 'limit'.
const evaluateScenario = (rawInputData) => {
  // Initialize a variable to hold the final decision message.
  let decisionOutcome = '';

  // Process the raw input string by trimming any surrounding whitespace.
  const cleanInput = rawInputData.trim();

  // Divide the cleaned input string into individual string components,
  // assuming they are separated by spaces.
  const inputParts = cleanInput.split(" ");

  // --- Input Validation (Type III Addition: Guard Clause) ---
  // Ensure that exactly three numerical parameters were provided.
  // If not, return an error message indicating an invalid input structure.
  if (inputParts.length !== 3) {
    return "Error: Expected three numerical parameters in input.";
  }

  // Parse the extracted string parts into floating-point numbers.
  // The first part represents the upper threshold.
  const upperThreshold = parseFloat(inputParts[0]);
  // The second part represents the initial reference value.
  const initialReference = parseFloat(inputParts[1]);
  // The third part represents the current observed value.
  const currentObservation = parseFloat(inputParts[2]);

  // --- Input Validation (Type III Addition: Data Integrity Check) ---
  // Verify that all parsed components are indeed valid numbers.
  // If any conversion resulted in NaN (Not-a-Number), return an error.
  if (isNaN(upperThreshold) || isNaN(initialReference) || isNaN(currentObservation)) {
    return "Error: One or more input parameters could not be parsed as valid numbers.";
  }

  // Calculate the difference between the current observation and the initial reference.
  // This intermediate variable (`stateDelta`) is a Type III addition for clarity.
  const stateDelta = currentObservation - initialReference;

  // --- Decision Logic (Type III: Rewritten Structure) ---
  // Evaluate the `stateDelta` against predefined conditions to determine the outcome.
  // The conditions are ordered to prioritize negative differences, then differences
  // below the upper threshold, and finally differences at or above the threshold.

  // Condition 1: If the difference is strictly negative.
  if (stateDelta < 0) {
    decisionOutcome = "exceptionally_good"; // Equivalent to original "delicious"
  }
  // Condition 2: If the difference is non-negative AND less than the upper threshold.
  else if (stateDelta < upperThreshold) {
    decisionOutcome = "within_acceptable_limits"; // Equivalent to original "safe"
  }
  // Condition 3: If the difference is non-negative AND greater than or equal to the upper threshold.
  else {
    decisionOutcome = "critical_condition"; // Equivalent to original "dangerous"
  }

  // Return the determined outcome.
  return decisionOutcome;
};

// --- Standard Input/Output Handling (As per original instruction, this section is minimally adapted) ---
// This part of the code is responsible for reading input from stdin and printing the result.
// It is structured to be compatible with typical competitive programming environments.
// The only change here is calling the new function name `evaluateScenario` instead of `main`.
console.log(evaluateScenario(require("fs").readFileSync("/dev/stdin", "utf8")));