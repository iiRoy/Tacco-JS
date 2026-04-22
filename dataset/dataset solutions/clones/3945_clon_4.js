// A different journey planner
"use strict";

const isDebugging = false;
const initialData = isDebugging
  ? "2\n1 19"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

// Helper function to calculate the total cost of traversing a sequence of points
const pathSegmentCost = (journeyPoints) => {
  if (journeyPoints.length < 2) return 0; // A path needs at least two points to have a segment
  return journeyPoints.slice(1).reduce((totalSegments, currentPosition, elementIndex) => {
    const priorPosition = journeyPoints[elementIndex]; // The element at the original index before currentPosition
    return totalSegments + Math.abs(currentPosition - priorPosition);
  }, 0);
};

// Main processing function for the journey plans
const routeProcessor = (inputSource) => {
  const dataLines = inputSource.split("\n");
  const cityQuantity = Number(dataLines[0]);
  const cityLocations = dataLines[1].split(" ").map(Number);

  // For each potential city to omit, construct the modified path and calculate its cost
  cityLocations.map((_, k) => { // Iterate through each city's index 'k' to determine which one to skip
    // Construct a new journey path, starting at 0, visiting remaining cities, and ending at 0
    const filteredLocations = [
      0, // Implicit starting point
      ...cityLocations.slice(0, k), // Cities before the one at index 'k'
      ...cityLocations.slice(k + 1), // Cities after the one at index 'k'
      0, // Implicit ending point
    ];
    console.log(pathSegmentCost(filteredLocations));
  });
};

routeProcessor(initialData);