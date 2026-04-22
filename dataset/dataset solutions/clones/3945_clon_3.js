// A revised approach for optimizing coordinate traversals
"use strict";

// Configuration flag for development environment.
const IS_DEVELOPMENT_CONTEXT = false;

/**
 * Computes the absolute difference between two numerical values.
 * This function serves as a utility for distance calculations, ensuring a positive result.
 * @param {number} valueA - The first numeric operand.
 * @param {number} valueB - The second numeric operand.
 * @returns {number} The non-negative difference between valueA and valueB.
 */
const obtainMagnitudeDifference = (valueA, valueB) => {
  // An alternative implementation to Math.abs, demonstrating a structural change.
  // Functionally equivalent for calculating absolute differences.
  if (valueA > valueB) {
    return valueA - valueB;
  } else {
    return valueB - valueA;
  }
};

// Variable to hold the entire input content, either from mock data or standard input.
let inputSourceContent;

// Conditional block to determine input origin based on the development context.
if (IS_DEVELOPMENT_CONTEXT) {
  // Using hardcoded data for local testing and debugging purposes.
  inputSourceContent = "2\n1 19";
} else {
  // For production execution, read data from the standard input file descriptor.
  const fileSystemHandler = require("fs");
  inputSourceContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Primary function to process coordinate data and evaluate various path scenarios.
 * It calculates total path lengths when individual points are hypothetically skipped.
 * @param {string} rawTextPayload - The raw string input containing point count and coordinates.
 */
const analyzeTraversalOutcomes = (rawTextPayload) => {
  // Initial validation: Check for the presence of input data.
  if (!rawTextPayload || rawTextPayload.length === 0) {
    // If no data, log an error and terminate execution.
    console.error("Error: The provided input payload is empty or invalid.");
    return;
  }

  // Divide the input string into separate lines based on newline characters.
  const segmentsOfInput = rawTextPayload.split("\n");

  // Extract the total number of geographical points from the first line.
  // Using Number() for explicit type conversion.
  const geographicalPointCount = Number(segmentsOfInput[0]);

  // Robust validation for the parsed point count.
  if (isNaN(geographicalPointCount) || geographicalPointCount <= 0 || !Number.isInteger(geographicalPointCount)) {
    console.error("Error: The specified number of points is invalid. Must be a positive integer.");
    return;
  }

  // Parse the string of coordinates from the second line into an array of numbers.
  const stringifiedCoordinates = segmentsOfInput[1].split(" ");

  // Transform string coordinates into numeric values, adding validation for each.
  const actualLocationPoints = stringifiedCoordinates.map(singleCoordString => {
    const numericCoord = Number(singleCoordString);
    // Validate each individual coordinate to ensure it's a valid number.
    if (isNaN(numericCoord)) {
      console.warn(`Warning: Encountered a non-numeric coordinate: '${singleCoordString}'. Defaulting to 0.`);
      return 0; // Provide a fallback, though better error handling might be required.
    }
    return numericCoord;
  });

  // Construct an augmented array of coordinates by adding virtual start (0) and end (0) points.
  // This helps standardize distance calculations for the first and last actual points.
  const augmentedCoordinateList = [];
  augmentedCoordinateList.push(0); // Add the initial boundary point.
  // Append all actual geographical points to the list.
  augmentedCoordinateList.push(...actualLocationPoints);
  augmentedCoordinateList.push(0); // Add the final boundary point.

  // Calculate the baseline total path length considering all actual points in sequence.
  let cumulativePathLength = 0;
  // Employing a standard for-loop instead of a higher-order array method like reduce.
  for (let currentPos = 1; currentPos < augmentedCoordinateList.length; currentPos++) {
    const currentWaypointValue = augmentedCoordinateList[currentPos];
    const precedingWaypointValue = augmentedCoordinateList[currentPos - 1];
    cumulativePathLength += obtainMagnitudeDifference(currentWaypointValue, precedingWaypointValue);
  }

  // An array to accumulate the calculated path lengths for each 'skip' scenario.
  const computedPathResults = [];

  // Iterate through each actual geographical point to simulate its omission from the path.
  // The loop index 'omissionCandidateIndex' corresponds to the 1-based index of the actual points.
  for (let omissionCandidateIndex = 1; omissionCandidateIndex <= geographicalPointCount; omissionCandidateIndex++) {
    // Identify the three critical points involved in the current segment:
    // The point immediately before the one being considered for omission.
    const antecedentWaypoint = augmentedCoordinateList[omissionCandidateIndex - 1];
    // The point currently being considered for omission.
    const pointToBypass = augmentedCoordinateList[omissionCandidateIndex];
    // The point immediately after the one being considered for omission.
    const subsequentWaypoint = augmentedCoordinateList[omissionCandidateIndex + 1];

    // Calculate the total distance of the two segments that would be removed.
    const segmentBeforeBypass = obtainMagnitudeDifference(pointToBypass, antecedentWaypoint);
    const segmentAfterBypass = obtainMagnitudeDifference(pointToBypass, subsequentWaypoint);
    const totalDistanceRemoved = segmentBeforeBypass + segmentAfterBypass;

    // Calculate the distance of the new direct segment that would replace the removed ones.
    const directConnectionDistance = obtainMagnitudeDifference(antecedentWaypoint, subsequentWaypoint);

    // Compute the new total path length for the current scenario.
    const scenarioSpecificLength = cumulativePathLength - totalDistanceRemoved + directConnectionDistance;
    computedPathResults.push(scenarioSpecificLength);
  }

  // Display each computed path length, one per line.
  for (const finalOutcome of computedPathResults) {
    console.log(finalOutcome);
  }
};

// Initiate the analysis process with the loaded input data.
analyzeTraversalOutcomes(inputSourceContent);