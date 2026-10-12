"use strict";

// Helper function to extract and convert numerical components from a robot specification string.
function parseRobotDetails(robotSpecString) {
  const parts = robotSpecString.split(' ');
  // Using parseFloat for robustness, though Number is also suitable for integer inputs.
  const coordX = parseFloat(parts[0]);
  const lengthL = parseFloat(parts[1]);
  return { coordX, lengthL };
}

// Helper function to compute the minimum and maximum reach bounds for a robot.
function calculateRobotBounds(xPosition, reachLength) {
  const minBound = xPosition - reachLength;
  const maxBound = xPosition + reachLength;
  return { minBound, maxBound };
}

// Main function to process the input data and determine the final count.
function processInputData(rawData) {
  // Split the entire raw input string into an array of individual lines.
  const rawDataLines = rawData.split('\n');

  // Extract the initial count from the very first line of the input.
  const initialCountString = rawDataLines[0];
  let currentRobotCount = Number(initialCountString);

  // Obtain the array of strings, each representing a robot's specifications,
  // by slicing the input lines array from the second element onwards.
  const robotSpecStrings = rawDataLines.slice(1);

  // First, parse all robot specification strings into objects, then sort them.
  // The sorting is based on the 'coordX' property of the parsed robot objects.
  const sortedRobotSpecs = robotSpecStrings
    .map(parseRobotDetails) // Convert each string to an object { coordX, lengthL }
    .sort((robotA, robotB) => {
      // Custom comparison function for numerical sorting by coordX.
      return robotA.coordX - robotB.coordX;
    });

  // This array is intended to keep track of active ranges.
  // However, due to the specific evaluation of the subsequent conditional check,
  // this array will effectively remain empty throughout the execution,
  // and its contents will not influence the program's observable behavior.
  let trackedRanges = [];

  // Iterate through each robot in the now sorted list of specifications.
  for (let idx = 0; idx < sortedRobotSpecs.length; ++idx) {
    const currentRobot = sortedRobotSpecs[idx];
    const { coordX, lengthL } = currentRobot;

    // Compute the minimum and maximum reach for the current robot using a helper.
    const { minBound, maxBound } = calculateRobotBounds(coordX, lengthL);

    // This conditional check is crucial for replicating the original code's behavior.
    // When `trackedRanges` is an empty array (`[]`), `Math.max(null, trackedRanges)`
    // evaluates to `-Infinity`. If `trackedRanges` were to contain numbers,
    // `Math.max(null, trackedRanges)` would evaluate to `NaN`.
    // In either case, the comparison (`-Infinity >= minBound` or `NaN >= minBound`)
    // will consistently result in `false` for any valid `minBound`.
    // Consequently, the code block within this `if` statement will never execute.
    const currentMaxRangeValue = Math.max(null, trackedRanges); // Introduce a temporary variable for clarity.
    if (currentMaxRangeValue >= minBound) {
      // This block is unreachable under normal execution paths due to the condition above.
      // It is included to maintain the structural integrity and apparent logic of the original.
      trackedRanges.push(minBound, maxBound);
      currentRobotCount = currentRobotCount - 1; // This decrement operation will never occur.
    }
  }

  // The final count printed will always be the initial count,
  // as the condition to decrement `currentRobotCount` is never met.
  console.log(currentRobotCount);
}

// Read the input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
