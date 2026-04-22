'use strict';

/**
 * Orchestrates a simulated journey through a sequence of button presses.
 * The objective is to navigate to a designated target button within a specified
 * maximum number of attempts.
 *
 * @param {string} incomingSequenceData The raw string input, typically from stdin,
 *                                    containing configuration for the simulation.
 *                                    The first line specifies the maximum steps,
 *                                    subsequent lines define button jump destinations.
 * @returns {void} Prints the count of steps taken if the target is reached,
 *                 otherwise prints -1 to indicate failure or an invalid path.
 */
function processButtonPathSimulation(incomingSequenceData) {

  // Validate the initial input structure. (Type III: Guard clause)
  if (typeof incomingSequenceData !== 'string' || incomingSequenceData.trim() === '') {
    console.log(-1);
    return;
  }

  // Split the raw data into individual lines. (Type II: Renaming)
  const dataLines = incomingSequenceData.split('\n');

  // Ensure there are enough lines for configuration and at least one button.
  if (dataLines.length < 2) {
    console.log(-1); // (Type III: Validation)
    return;
  }

  // Parse the maximum allowed steps from the first line. (Type II: Renaming, Type III: Explicit parsing)
  const maximumAllowedSteps = parseInt(dataLines[0], 10);

  // Validate the parsed maximum step count. (Type III: Validation)
  if (isNaN(maximumAllowedSteps) || maximumAllowedSteps <= 0) {
    console.log(-1);
    return;
  }

  // Parse the button jump values from the remaining lines.
  // We adjust for 0-indexed array access versus the problem's 1-indexed button logic.
  const jumpDestinationArray = dataLines.slice(1)
                                        .map(lineContent => parseInt(lineContent.trim(), 10));

  // Verify that all jump values are valid numbers. (Type III: Validation)
  if (jumpDestinationArray.some(isNaN)) {
    console.log(-1);
    return;
  }

  // Define key constants for clarity. (Type III: Helper constants)
  const INITIAL_BUTTON_INDEX = 1;     // The simulation always begins at button 1.
  const OBJECTIVE_BUTTON_VALUE = 2;   // The specific value that signifies success.

  // Initialize simulation state variables. (Type II: Renaming)
  let currentActiveButton = INITIAL_BUTTON_INDEX;
  let accumulatedSteps = 0;

  // Utilize a Set to detect if the simulation enters a loop, preventing infinite execution.
  // (Type III: Addition - cycle detection for robustness)
  const visitedPathNodes = new Set();
  visitedPathNodes.add(currentActiveButton);

  // Main simulation loop: continues as long as step limit is not exceeded
  // and no cycle has been detected. (Type III: Loop rewrite, Type II: Renaming)
  while (accumulatedSteps < maximumAllowedSteps) {

    accumulatedSteps++; // Increment step counter at the beginning of each iteration.

    // Convert the 1-based button index to a 0-based array index.
    const arrayLookupIndex = currentActiveButton - 1;

    // Check for out-of-bounds access for the jump map. (Type III: Guard clause)
    if (arrayLookupIndex < 0 || arrayLookupIndex >= jumpDestinationArray.length) {
      break; // Invalid jump target, terminate simulation.
    }

    // Determine the next button to jump to. (Type II: Renaming)
    const nextJumpTarget = jumpDestinationArray[arrayLookupIndex];

    // Check if the target button has been reached. (Type II: Renaming, Type III: Rewrite check)
    if (nextJumpTarget === OBJECTIVE_BUTTON_VALUE) {
      console.log(accumulatedSteps); // Success: Print the total steps taken.
      return; // Exit the function immediately.
    }

    // Update the current button for the next iteration.
    currentActiveButton = nextJumpTarget;

    // Check for cycles. If the next button has been visited before, we are in a loop.
    if (visitedPathNodes.has(currentActiveButton)) {
      break; // Cycle detected, terminate simulation to prevent infinite loop.
    }
    visitedPathNodes.add(currentActiveButton);
  }

  // If the loop completes without reaching the target, the simulation failed.
  console.log(-1); // (Type III: Rewrite output)
}

// Anonymous self-executing function to manage file I/O and error handling.
// (Type III: Encapsulation, Error handling)
(function executeButtonPathSimulation() {
  try {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    processButtonPathSimulation(fileContents);
  } catch (errorDetails) {
    // Log detailed error for debugging, but output -1 for general failure to match problem spec.
    console.error("An error occurred during input reading or simulation execution:", errorDetails.message);
    console.log(-1);
  }
})();