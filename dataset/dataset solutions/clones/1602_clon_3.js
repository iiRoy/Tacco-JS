// This module contains a utility function to compute the optimal final coordinate
// after a series of movements, aiming to minimize distance from the origin (0).
function calculateFinalCoordinate(payloadString) {
  // --- Input Processing and Validation (Type II & III Changes) ---

  // Ensure the payload is a string and remove any leading/trailing whitespace.
  const trimmedPayload = payloadString ? String(payloadString).trim() : '';

  // Split the payload into lines; we expect the first line to contain all parameters.
  const rawLines = trimmedPayload.split('\n');

  // If there's no data or the first line is empty, log an error and exit.
  if (!rawLines.length || rawLines[0].length === 0) {
    console.error("Input processing error: Payload is empty or malformed.");
    return;
  }

  // Extract individual string parameters from the first line.
  const stringParameters = rawLines[0].split(' ');

  // Validate the number of parameters. We need exactly three.
  if (stringParameters.length !== 3) {
    console.error(`Input processing error: Expected 3 parameters, but received ${stringParameters.length}.`);
    return;
  }

  // Convert string parameters to numbers. Using Number() for type diversity.
  const startingPoint = Number(stringParameters[0]);
  const totalMovesAllowed = Number(stringParameters[1]);
  const moveStepSize = Number(stringParameters[2]);

  // --- Parameter Validation (Type III Additions) ---

  // Check if any of the parsed values are not valid numbers.
  if (isNaN(startingPoint) || isNaN(totalMovesAllowed) || isNaN(moveStepSize)) {
    console.error("Validation error: One or more input parameters are not valid numerical values.");
    return;
  }

  // Ensure the step size is positive to avoid division by zero or illogical movements.
  if (moveStepSize <= 0) {
    console.error("Validation error: The movement step size must be a positive integer.");
    return;
  }

  // Ensure the total moves allowed is non-negative.
  if (totalMovesAllowed < 0) {
      console.error("Validation error: Total moves allowed cannot be negative.");
      return;
  }

  // --- Core Logic for Optimal Path Calculation (Type II & III Changes) ---

  // We are interested in the absolute distance from zero.
  const currentAbsolutePosition = Math.abs(startingPoint);

  // Calculate how many steps can be taken directly towards zero without crossing it.
  // This is the 'optimal direct approach'.
  const directStepsTowardsOrigin = Math.floor(currentAbsolutePosition / moveStepSize);

  let calculatedFinalDistance; // Renamed 'ans' and initialized later.

  // Scenario 1: We don't have enough steps to reach or cross zero fully.
  // We simply move as many steps as possible towards zero.
  if (totalMovesAllowed <= directStepsTowardsOrigin) {
    calculatedFinalDistance = currentAbsolutePosition - (moveStepSize * totalMovesAllowed);
  } else {
    // Scenario 2: We have enough steps to reach or cross zero.
    // First, move to the closest point to zero using 'directStepsTowardsOrigin' steps.
    const remainingStepsAfterOptimalApproach = totalMovesAllowed - directStepsTowardsOrigin;
    const positionAfterOptimalApproach = currentAbsolutePosition - (moveStepSize * directStepsTowardsOrigin);

    // If the remaining steps are even, we'll end up back at 'positionAfterOptimalApproach'
    // because each pair of steps (one away, one back) cancels out.
    if (remainingStepsAfterOptimalApproach % 2 === 0) {
      calculatedFinalDistance = positionAfterOptimalApproach;
    } else {
      // If the remaining steps are odd, we take one more step, which moves us away from zero.
      // The final position will be 'moveStepSize' minus 'positionAfterOptimalApproach'.
      // This effectively calculates the distance from zero after one final "overshoot" step.
      calculatedFinalDistance = moveStepSize - positionAfterOptimalApproach;
    }
  }

  // --- Output Result ---
  console.log(calculatedFinalDistance);
}

// Entry point for execution: Read input from standard input and pass to the main function.
// This assumes a Node.js environment where 'fs' module is available.
calculateFinalCoordinate(require("fs").readFileSync("/dev/stdin", "utf8"));