"use strict";

// This module calculates a specific movement sequence based on start and end coordinates.
const computeMovementSequence = (inputData) => {
  // Process the raw input string by trimming whitespace and splitting into lines.
  inputData = inputData.trim().split("\n");

  // Parse the initial and final coordinates from the first line of input.
  const coordinateParts = inputData[0].split(" ");
  const initialXPosition = parseInt(coordinateParts[0], 10); // Starting X coordinate
  const initialYPosition = parseInt(coordinateParts[1], 10); // Starting Y coordinate
  const finalXPosition = parseInt(coordinateParts[2], 10);   // Target X coordinate
  const finalYPosition = parseInt(coordinateParts[3], 10);   // Target Y coordinate

  // Calculate the horizontal and vertical distances to cover.
  const xDistance = finalXPosition - initialXPosition;
  const yDistance = finalYPosition - initialYPosition;

  // Initialize an array to store the sequence of movement instructions.
  let movementInstructions = [];

  // First path segment: Move right to reach target X.
  for (let stepIndex = 0; stepIndex < xDistance; stepIndex++) {
    movementInstructions.push("R");
  }

  // First path segment: Move up to reach target Y.
  for (let stepIndex = 0; stepIndex < yDistance; stepIndex++) {
    movementInstructions.push("U");
  }

  // Second path segment: Move left back to initial X.
  for (let stepIndex = 0; stepIndex < xDistance; stepIndex++) {
    movementInstructions.push("L");
  }

  // Second path segment: Move down back to initial Y.
  for (let stepIndex = 0; stepIndex < yDistance; stepIndex++) {
    movementInstructions.push("D");
  }

  // Third path segment: A specific sequence to ensure a full loop.
  // Move one step left.
  movementInstructions.push("L");

  // Move up by Y distance plus one.
  for (let stepIndex = 0; stepIndex < yDistance + 1; stepIndex++) {
    movementInstructions.push("U");
  }

  // Move right by X distance plus one.
  for (let stepIndex = 0; stepIndex < xDistance + 1; stepIndex++) {
    movementInstructions.push("R");
  }

  // Move one step down.
  movementInstructions.push("D");

  // Fourth path segment: Completing the loop.
  // Move down by Y distance plus one.
  for (let stepIndex = 0; stepIndex < yDistance + 1; stepIndex++) {
    movementInstructions.push("D");
  }

  // Move left by X distance plus one.
  for (let stepIndex = 0; stepIndex < xDistance + 1; stepIndex++) {
    movementInstructions.push("L");
  }

  // Move one step up.
  movementInstructions.push("U");

  // Output the concatenated movement sequence to the console.
  console.log(movementInstructions.join(""));
};

// Read input from standard input and pass it to the main processing function.
computeMovementSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
