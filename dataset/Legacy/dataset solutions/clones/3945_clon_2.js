/*
 * This module computes a modified travel plan based on input coordinates.
 * It calculates the total distance and then, for each point,
 * determines the distance if that point were skipped.
 */

"use strict";

const DEVELOPMENT_FLAG = false; // Set to true for testing with hardcoded input
const initialData = DEVELOPMENT_FLAG
  ? "2\n1 19" // Sample input for debugging
  : require("fs") // Node.js file system module
      .readFileSync("/dev/stdin", "utf8") // Read input from standard input
      .trim(); // Remove leading/trailing whitespace

/**
 * Computes the travel plan modifications.
 * @param {string} inputString - The raw input string from stdin.
 */
const calculateTravelPlan = (inputString) => {
  // Split the input into individual lines
  const lineSegments = inputString.split("\n");

  // Parse the number of points from the first line
  const pointCount = parseInt(lineSegments[0], 10);

  // Parse the coordinates, add a 0 at the start and end for boundary calculations
  const extendedPoints = [
    0, // Starting virtual point
    ...lineSegments[1].split(" ").map((val) => parseInt(val, 10)), // Actual points
    0, // Ending virtual point
  ];

  // Calculate the initial total distance of the path
  const overallPathLength = extendedPoints.reduce(
    (accumulator, currentPoint, idx) => {
      // For the first point (index 0), accumulator is 0.
      // Otherwise, add the absolute difference between current and previous point.
      return idx === 0
        ? accumulator
        : accumulator + Math.abs(currentPoint - extendedPoints[idx - 1]);
    },
    0 // Initial value for the accumulator
  );

  // Iterate through each actual point (excluding the virtual start/end)
  for (let j = 1; j < pointCount + 1; j++) {
    // Get the coordinates of the points involved in the current segment
    const priorPoint = extendedPoints[j - 1]; // Point before the one being considered for skipping
    const omittedPoint = extendedPoints[j]; // The point currently being considered for skipping
    const subsequentPoint = extendedPoints[j + 1]; // Point after the one being considered for skipping

    // Calculate the distance that would be removed if 'omittedPoint' is skipped
    const removedSegmentLength =
      Math.abs(omittedPoint - priorPoint) +
      Math.abs(omittedPoint - subsequentPoint);

    // Calculate the new direct distance if 'omittedPoint' is skipped
    const addedSegmentLength = Math.abs(priorPoint - subsequentPoint);

    // Output the new total distance: original total - removed segments + new direct segment
    console.log(overallPathLength - removedSegmentLength + addedSegmentLength);
  }
};

// Execute the main function with the obtained input
calculateTravelPlan(initialData);
