"use strict";

// This module processes input data to determine the maximum number of non-overlapping intervals.

function ProcessInput(rawText) {
  // Split the entire input string into individual lines.
  let inputLines = rawText.split('\n');

  // The first line contains the total count of entities, but it's not directly used in the algorithm's core logic.
  let entityCount = Number(inputLines[0]);

  // Extract the lines describing each entity (robot specifications).
  const entitySpecifications = inputLines.slice(1, inputLines.length);

  // Transform each entity specification into an interval [x - d, x + d].
  // Here, x is the robot's position and d is its radius.
  const calculatedIntervals = entitySpecifications.map(currentSpecLine => {
    // Parse the position and radius from the current specification line.
    let positionAndRadius = currentSpecLine.split(' ').map(Number);
    // Calculate the start and end points of the interval.
    return [positionAndRadius[0] - positionAndRadius[1], positionAndRadius[0] + positionAndRadius[1]];
  });

  // Sort the intervals based on their end points in ascending order.
  // This is a crucial step for the greedy algorithm to work correctly.
  calculatedIntervals.sort((firstInterval, secondInterval) => firstInterval[1] > secondInterval[1]);

  // Initialize a list to store the end points of selected non-overlapping intervals.
  // Start with a very small number to ensure the first interval can always be selected.
  let selectedIntervalEndPoints = [-10000000000]; // Represents negative infinity for practical purposes.

  // Initialize a counter for the number of non-overlapping intervals found.
  let nonOverlappingCount = 0;

  // Iterate through each calculated interval.
  for (let currentIdx = 0; currentIdx < calculatedIntervals.length; ++currentIdx) {
    const intervalStart = calculatedIntervals[currentIdx][0]; // The start point of the current interval.
    const intervalEnd = calculatedIntervals[currentIdx][1];   // The end point of the current interval.

    // Check if the current interval's start point is greater than or equal to
    // the maximum end point of all previously selected non-overlapping intervals.
    // If it is, this interval does not overlap with the last selected one and can be chosen.
    if (Math.max.apply(null, selectedIntervalEndPoints) <= intervalStart) {
      // Add the end point of this non-overlapping interval to our selection.
      selectedIntervalEndPoints.push(intervalEnd);
      // Increment the count of selected non-overlapping intervals.
      nonOverlappingCount++;
    }
  }

  // Output the final count of non-overlapping intervals.
  console.log(nonOverlappingCount);
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
