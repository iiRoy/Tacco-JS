'use strict';

/**
 * Processes raw input containing location data to calculate
 * various travel distances based on skipping intermediate points.
 * This function simulates removing each middle location one at a time
 * and reports the total travel distance for each such scenario.
 *
 * @param {string} rawInput - The complete input string,
 *                            expected to have location values on the second line.
 */
function calculateAdjustedTravels(rawInput) {
  // Defensive programming: Validate the input type and content upfront.
  if (typeof rawInput !== 'string' || rawInput.trim() === '') {
    console.error("ERROR: Input must be a non-empty string. Aborting calculation.");
    return;
  }

  const allInputLines = rawInput.trim().split('\n');

  // Expecting at least two lines: one for count (ignored) and one for actual data.
  if (allInputLines.length < 2) {
    console.error("ERROR: Input string must contain at least two lines of data. Aborting.");
    return;
  }

  // Parse the numerical location values from the second line of the input.
  const parsedLocationCoordinates = allInputLines[1].split(' ').map(coordinateStr => {
    const numericCoord = Number(coordinateStr);
    // Further validation to ensure all parts are valid numbers.
    if (isNaN(numericCoord)) {
      throw new Error(`Invalid coordinate value encountered: '${coordinateStr}'. All coordinates must be numbers.`);
    }
    return numericCoord;
  });

  // Helper function to compute the absolute distance between two points.
  const computeSegmentLength = (startPoint, endPoint) => Math.abs(startPoint - endPoint);

  // Augment the list of actual locations with virtual start and end points at 0.
  // This simplifies the boundary conditions for distance calculations.
  // E.g., [L1, L2, L3] becomes [0, L1, L2, L3, 0].
  const fullTravelPath = [0, ...parsedLocationCoordinates, 0];

  // Calculate the initial total travel distance without skipping any points.
  // This is the sum of absolute distances between all consecutive points in fullTravelPath.
  let baselineTotalDistance = 0;
  for (let segmentIndex = 0; segmentIndex < fullTravelPath.length - 1; segmentIndex++) {
    baselineTotalDistance += computeSegmentLength(fullTravelPath[segmentIndex], fullTravelPath[segmentIndex + 1]);
  }

  // This array will store the computed total distances for each scenario
  // where one intermediate location is bypassed.
  const computedScenarioDistances = [];

  // Iterate through each *original* intermediate location.
  // The loop starts at index 1 and goes up to, but not including, the last element.
  // These indices correspond to the actual user-provided locations, excluding the virtual 0s.
  for (let locationToEvaluateIdx = 1; locationToEvaluateIdx < fullTravelPath.length - 1; locationToEvaluateIdx++) {
    const priorLocation = fullTravelPath[locationToEvaluateIdx - 1];
    const currentFocusLocation = fullTravelPath[locationToEvaluateIdx];
    const subsequentLocation = fullTravelPath[locationToEvaluateIdx + 1];

    // Scenario 1: Calculate the direct distance if the 'currentFocusLocation' is skipped.
    // This is a direct path from 'priorLocation' to 'subsequentLocation'.
    const distanceIfBypassed = computeSegmentLength(priorLocation, subsequentLocation);

    // Scenario 2: Calculate the distance if 'currentFocusLocation' is included.
    // This involves two segments: 'priorLocation' to 'currentFocusLocation',
    // and 'currentFocusLocation' to 'subsequentLocation'.
    const distanceIfTraversed = computeSegmentLength(priorLocation, currentFocusLocation) +
                                computeSegmentLength(currentFocusLocation, subsequentLocation);

    // Determine the net change in total distance when 'currentFocusLocation' is skipped.
    // This is (distance without) - (distance with).
    const netChangeInTravel = distanceIfBypassed - distanceIfTraversed;

    // The new total travel distance for this scenario is the baseline total
    // adjusted by the net change calculated above.
    computedScenarioDistances.push(baselineTotalDistance + netChangeInTravel);
  }

  // Output all calculated scenario distances, each on a new line.
  console.log(computedScenarioDistances.join('\n'));
}

// Entry point for execution: Read input from standard input and process it.
try {
  const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
  calculateAdjustedTravels(fileData);
} catch (executionError) {
  // Provide robust error handling for file reading or parsing issues.
  console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
  // In a production environment, one might also exit with a non-zero status code.
  // process.exit(1);
}