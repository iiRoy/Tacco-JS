"use strict";

/**
 * Defines the specific node value that represents the final target or destination.
 * The traversal aims to reach this value.
 */
const TARGET_NODE_VALUE = 2;

/**
 * Processes raw input text to simulate a directed graph traversal problem.
 * It counts the steps required to reach a predefined target node (2)
 * starting from an initial node specified by the input sequence.
 *
 * @param {string} rawInputContent - The complete input string, typically from stdin,
 *                                  where lines are separated by newline characters.
 * @returns {number} The number of steps taken to successfully reach the TARGET_NODE_VALUE.
 *                   Returns -1 if the target is unreachable, if input is invalid,
 *                   or if a cycle is detected before reaching the target within
 *                   the maximum allowed steps.
 */
const conductSequenceTraversal = function(rawInputContent) {
  // Normalize and split the input string into an array of individual lines.
  // .trim() helps to handle any leading/trailing whitespace in the overall input.
  const inputLines = rawInputContent.trim().split('\n');

  // Validate that there is at least one line to parse, which should contain the sequence count.
  if (inputLines.length === 0) {
    return -1; // Indicate failure due to missing input.
  }

  // Parse the first line to determine the total number of elements in the sequence.
  // Using the unary plus operator for concise string-to-number conversion.
  const sequenceElementCount = +inputLines[0];

  // Perform robust validation on the sequence element count.
  // It must be a positive integer to represent a valid sequence length.
  if (isNaN(sequenceElementCount) || sequenceElementCount <= 0 || !Number.isInteger(sequenceElementCount)) {
    return -1; // Invalid sequence length.
  }

  // Initialize an array to store the "link" or "next hop" values.
  // These values are 1-indexed as per typical problem statements,
  // so they will need adjustment (subtracting 1) for 0-indexed array access.
  const linkTargets = [];

  // Iterate through the remaining input lines to populate the linkTargets array.
  // The loop starts from the second line (index 1) and continues for 'sequenceElementCount' times.
  for (let currentLineIndex = 1; currentLineIndex <= sequenceElementCount; currentLineIndex++) {
    // Ensure that we have enough lines in the input for the declared sequenceElementCount.
    if (currentLineIndex >= inputLines.length) {
      return -1; // Not enough data provided.
    }

    const lineDataString = inputLines[currentLineIndex];
    const parsedTargetValue = +lineDataString; // Convert current line string to number.

    // Validate each individual target value parsed from the input.
    // Target values should also be positive integers and within the bounds of the sequence.
    if (isNaN(parsedTargetValue) || parsedTargetValue <= 0 || parsedTargetValue > sequenceElementCount || !Number.isInteger(parsedTargetValue)) {
      return -1; // Invalid target value encountered.
    }
    linkTargets.push(parsedTargetValue);
  }

  // Initialize variables for the traversal simulation.
  let currentPositionValue = linkTargets[0]; // Start at the value of the first element in the sequence.
  let totalTraversalSteps = 0; // Counter for the number of steps taken.

  // Set an explicit limit for the number of steps. If the target is not reached
  // within 'sequenceElementCount' steps, it implies a cycle or an unreachable path.
  const maximumAllowedHops = sequenceElementCount;

  // Begin the traversal loop.
  // A while loop is used here, explicitly checking against the maximum allowed hops.
  while (totalTraversalSteps < maximumAllowedHops) {
    totalTraversalSteps++; // Increment the step counter for the current iteration.

    // Check if the current node value matches our desired target.
    if (currentPositionValue === TARGET_NODE_VALUE) {
      // If the target is reached, return the total steps taken.
      return totalTraversalSteps;
    }

    // Calculate the array index for the next hop.
    // Since linkTargets stores 1-indexed values, we subtract 1 for 0-indexed array access.
    const nextHopArrayIndex = currentPositionValue - 1;

    // Crucial check: validate if the calculated nextHopArrayIndex is within the valid bounds
    // of the linkTargets array. This prevents out-of-bounds errors and detects invalid links.
    if (nextHopArrayIndex < 0 || nextHopArrayIndex >= linkTargets.length) {
      // An invalid link was followed (points outside the sequence).
      // Since TARGET_NODE_VALUE was not reached, this path leads to nowhere.
      return -1;
    }
    
    // Update the current position to the value at the next calculated index.
    currentPositionValue = linkTargets[nextHopArrayIndex];
  }

  // If the loop completes without returning, it means the TARGET_NODE_VALUE was not
  // reached within the 'maximumAllowedHops'. This indicates that the target is
  // either unreachable, or the traversal entered a cycle that does not include the target.
  return -1;
};

// This immediately invoked function expression (IIFE) handles the input/output operations.
// It reads from standard input, calls the main processing function, and prints the result.
(function() {
  try {
    // Read the entire content of standard input as a UTF-8 string.
    const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf-8');
    
    // Execute the core logic with the obtained input.
    const finalOutcome = conductSequenceTraversal(standardInputData);
    
    // Output the computed result to standard output.
    console.log(finalOutcome);
  } catch (error) {
    // Catch and report any errors that occur during file reading or processing.
    // In case of an unexpected error, output -1 as per common problem constraints.
    console.error("An unexpected error occurred during execution:", error.message);
    console.log(-1);
  }
})();