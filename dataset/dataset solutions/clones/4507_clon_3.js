"use strict";

// This function processes a numerical jump sequence to find the shortest path to a target node.
// It parses input, validates it, and simulates jumps to reach a specific destination.
const solveJumpSequence = (rawInputData) => {
  // Define constants for clarity and potential future modification.
  const STARTING_POSITION = 1; // The sequence traversal begins from node 1 (1-indexed).
  const GOAL_POSITION = 2;     // The objective is to reach node 2.

  // Split the entire raw input string into an array of individual lines.
  const allInputLines = rawInputData.split("\n");

  // Attempt to parse the total number of elements that define the sequence.
  const totalElementsString = allInputLines[0];
  const totalNodesInSequence = parseInt(totalElementsString, 10);

  // --- Extensive Input Validation (Type III addition for robustness) ---
  // Validate the parsed number of elements.
  if (isNaN(totalNodesInSequence) || totalNodesInSequence < 1) {
    // If the count is not a valid positive number, it's an invalid input.
    console.log("-1"); // Indicate failure
    return;
  }

  // Ensure that there are enough input lines provided for the declared number of elements.
  if (allInputLines.length < totalNodesInSequence + 1) {
    // Missing data lines.
    console.log("-1"); // Indicate failure
    return;
  }
  // --- End of initial input validation ---

  // Extract the jump values from the input lines, converting each to a number.
  // The slice starts from the second line (index 1) up to `totalNodesInSequence` elements.
  const nodeConnectionsArray = allInputLines.slice(STARTING_POSITION, totalNodesInSequence + 1).map((lineValue, indexInSlice) => {
    const parsedNodeValue = parseInt(lineValue, 10);

    // --- Per-element validation (Type III addition) ---
    // Check if each parsed jump value is valid (a number, within the bounds of 1 to totalNodesInSequence).
    if (isNaN(parsedNodeValue) || parsedNodeValue < 1 || parsedNodeValue > totalNodesInSequence) {
      // If any jump value is invalid, we consider the entire input malformed and cannot proceed.
      // Throw an error to propagate this critical issue to the try-catch block.
      throw new Error(`Invalid node connection value '${lineValue}' detected at line ${indexInSlice + 2}. Expected a value between 1 and ${totalNodesInSequence}.`);
    }
    return parsedNodeValue;
  });

  // Initialize variables for the traversal simulation.
  let currentTraversalSteps = 0; // Counts how many jumps have been made.
  let activeTraversalNode = STARTING_POSITION; // Represents the current node in the sequence (1-indexed).

  // The core simulation loop: continue jumping until the goal is reached.
  while (activeTraversalNode !== GOAL_POSITION) {
    // Increment the step counter for each jump taken.
    currentTraversalSteps++;

    // --- Cycle Detection / Unreachable Destination Check (Type III update) ---
    // If the number of steps exceeds the total possible unique nodes, it means
    // we've entered an infinite loop (cycle) without reaching the destination.
    // In such a scenario, the destination is considered unreachable.
    if (currentTraversalSteps > totalNodesInSequence) {
      console.log("-1"); // Output the failure indicator.
      return;            // Terminate the function's execution.
    }

    // Determine the next node to jump to.
    // `nodeConnectionsArray` is 0-indexed, so we adjust the 1-indexed `activeTraversalNode`.
    const nextJumpValue = nodeConnectionsArray[activeTraversalNode - 1];

    // --- Additional bounds check for the target of the next jump (Type III addition) ---
    // Ensure that the value we're jumping to is a valid node within the sequence.
    if (nextJumpValue === undefined || nextJumpValue < 1 || nextJumpValue > totalNodesInSequence) {
        // This indicates a malformed sequence where a jump leads out of bounds.
        console.log("-1");
        return;
    }

    // Update the current node to the next jump's target.
    activeTraversalNode = nextJumpValue;
  }

  // If the loop completes, it signifies that the `GOAL_POSITION` was successfully reached.
  // Output the total number of steps taken to achieve this.
  console.log(currentTraversalSteps);
};

// --- Execution Entry Point (Type III modification for robust error handling) ---
// This block handles reading input from standard input and invoking the main solver function.
try {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  solveJumpSequence(fileContent);
} catch (encounteredError) {
  // Catch any errors that might occur during file reading or input parsing/validation within `solveJumpSequence`.
  // If an error is caught, it implies a critical failure in processing the input.
  console.log("-1"); // Always output -1 to indicate an unresolvable state or error.
}