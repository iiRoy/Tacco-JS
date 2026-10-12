"use strict";

// This module processes input data to determine if a journey is feasible.
const executeLogic = (rawInputContent) => {
  // Clean up the raw input string and split it into lines.
  rawInputContent = rawInputContent.trim().split("\n");

  // Parse the first line of input to extract numerical values.
  // The first number represents the total distance to cover.
  const totalDistance = parseInt(rawInputContent[0].split(" ")[0]);

  // The second number represents the maximum allowed time for the journey.
  const maxTime = parseInt(rawInputContent[0].split(" ")[1]);

  // The third number represents the constant travel speed.
  const travelSpeed = parseInt(rawInputContent[0].split(" ")[2]);

  // Calculate the time required for the journey (distance / speed).
  // Then, compare it with the maximum allowed time.
  // Output "Yes" if the required time is less than or equal to the max time, otherwise "No".
  console.log(totalDistance / travelSpeed <= maxTime ? "Yes" : "No");
};

// Read input from standard input and pass it to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
