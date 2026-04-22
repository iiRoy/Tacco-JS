/**
 * Module for evaluating the feasibility of a planned journey across a 2D grid.
 *
 * This script processes a sequence of waypoints, determining if it's possible
 * to travel between them within specified timeframes, adhering to movement rules.
 */

/**
 * Validates if a single step (segment) of the journey is feasible.
 * A step is feasible if:
 *   1. The duration is sufficient to cover the Manhattan distance.
 *   2. The duration and total Manhattan distance have the same parity.
 *
 * @param {number} stepDuration - The time allocated for this specific step.
 * @param {number} horizontalDelta - The absolute change in the X coordinate.
 * @param {number} verticalDelta - The absolute change in the Y coordinate.
 * @returns {boolean} True if the step is valid, false otherwise.
 */
const validateStepFeasibility = (stepDuration, horizontalDelta, verticalDelta) => {
  // Guard against invalid negative inputs, although typically handled by Math.abs in caller
  if (stepDuration < 0 || horizontalDelta < 0 || verticalDelta < 0) {
    return false; // A step cannot have negative duration or distance components
  }

  const totalManhattanDistance = horizontalDelta + verticalDelta;

  // Check if there's enough time to cover the distance
  if (stepDuration < totalManhattanDistance) {
    return false;
  }

  // Check if the parities match. This is crucial for grid movement.
  // (duration - distance) must be an even number.
  const durationParity = stepDuration % 2;
  const distanceParity = totalManhattanDistance % 2;

  // If the parities are different, it's impossible.
  if (durationParity !== distanceParity) {
    return false;
  }

  return true; // The step is feasible
};

/**
 * Assesses the overall viability of an entire path (sequence of waypoints).
 * It iterates through each segment, checking its feasibility.
 *
 * @param {Array<Array<number>>} waypointsSequence - An array of waypoint definitions.
 *   Each waypoint is an array: [targetTime, targetX, targetY].
 * @returns {boolean} True if the entire journey is viable, false otherwise.
 */
const assessPathViability = (waypointsSequence) => {
  // Initialize the current position and time to the origin
  let currentPosition = {
    t: 0,
    x: 0,
    y: 0
  };

  let successfulSegmentsCount = 0; // Helper variable for tracking progress

  // Iterate through each planned waypoint in the sequence
  for (let i = 0; i < waypointsSequence.length; ++i) {
    const currentWaypoint = waypointsSequence[i];

    // Destructure target coordinates and time for clarity
    const targetTime = currentWaypoint[0];
    const destinationX = currentWaypoint[1];
    const destinationY = currentWaypoint[2];

    // Calculate the time taken for this segment
    const timeSegment = targetTime - currentPosition.t;

    // Calculate the absolute change in coordinates for this segment
    const deltaX = Math.abs(currentPosition.x - destinationX);
    const deltaY = Math.abs(currentPosition.y - destinationY);

    // Use the helper function to validate this specific step
    const isSegmentValid = validateStepFeasibility(timeSegment, deltaX, deltaY);

    // If any segment is invalid, the entire path is not viable
    if (!isSegmentValid) {
      // console.error(`Journey failed at segment ${i+1}. Time: ${targetTime}, X: ${destinationX}, Y: ${destinationY}`);
      return false;
    }

    // Update the current position to the new waypoint if the segment was valid
    currentPosition.t = targetTime;
    currentPosition.x = destinationX;
    currentPosition.y = destinationY;
    successfulSegmentsCount++; // Increment counter for valid segments
  }

  // If all segments were successfully validated, the journey is viable
  // console.log(`All ${successfulSegmentsCount} segments successfully validated.`);
  return true;
};

/**
 * Main entry point for processing the input and executing the journey evaluation.
 * Reads input from stdin, parses it, and prints the result.
 *
 * @param {string} rawInputContent - The raw string content read from the input source.
 */
function executeJourneyEvaluation(rawInputContent) {
  // Basic input validation
  if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    console.error("Error: Empty or invalid input provided.");
    console.log("NO"); // Default to NO for invalid input
    return;
  }

  // Split the input into individual lines
  const inputLines = rawInputContent.trim().split('\n');

  // The first line typically contains the number of waypoints, which we might parse
  // but don't strictly need for the array iteration here.
  // const numberOfWaypoints = parseInt(inputLines[0], 10);

  // Parse the remaining lines into a structured plan (array of arrays of numbers)
  const journeyPlanData = inputLines
    .slice(1) // Skip the first line (waypoint count)
    .map(line => {
      // For each line, split by space and convert to integers
      return line.split(' ').map(val => parseInt(val, 10));
    });

  // Execute the core logic to determine if the journey is possible
  const overallJourneyOutcome = assessPathViability(journeyPlanData);

  // Output the result in a user-friendly format
  if (overallJourneyOutcome) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

// Ensure the script is run directly from a Node.js environment
if (require.main === module) {
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin";

  try {
    const scriptInput = fileSystemModule.readFileSync(standardInputPath, "utf8");
    executeJourneyEvaluation(scriptInput);
  } catch (error) {
    console.error(`Failed to read from stdin: ${error.message}`);
    console.log('NO'); // Indicate failure if input cannot be read
  }
}