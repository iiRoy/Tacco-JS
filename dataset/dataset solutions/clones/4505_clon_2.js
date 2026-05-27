"use strict";

// This function processes the input data to find a specific path within a sequence.
const processInput = function processInput(rawData) {
  // Split the raw input string into an array of individual lines.
  const lines = rawData.split('\n');

  // Parse the first line to determine the total number of elements in the sequence.
  const numElements = parseInt(lines[0], 10);

  // Initialize an array to store the sequence values, which are parsed from subsequent lines.
  let valueArray = [];

  // Iterate through the input lines, starting from the second line, to populate the value array.
  for (let idx = 1; idx <= numElements; idx++) {
    valueArray.push(parseInt(lines[idx], 10));
  }

  // Define the designated starting point for the traversal.
  const initialPosition = 1;

  // Set the current value to the element pointed to by the first value in the sequence (index 0).
  let currentValue = valueArray[0];

  // An array to keep track of all nodes visited during the traversal to detect cycles.
  let visitedNodes = [];

  // Mark the initial position as visited to handle the case where the first step leads back to start.
  visitedNodes.push(1);

  // A boolean flag to indicate whether the target value (2) has been successfully reached.
  let foundTarget = false;

  // A counter to record the number of steps taken during the traversal.
  let stepCounter = 0;

  // Begin the traversal loop; it continues as long as the current value is not the initial position.
  while (currentValue !== initialPosition) {
    stepCounter++; // Increment the step counter for each move.

    // Move to the next value in the sequence by using the current value as an index (1-based).
    currentValue = valueArray[currentValue - 1];

    // Check if the current value is the target value (2).
    if (currentValue === 2) {
      foundTarget = true; // If found, set the flag.
      break; // Exit the loop immediately as the target is reached.
    }

    // Check if the current value has been visited before, indicating a cycle.
    if (visitedNodes.indexOf(currentValue) >= 0) {
      break; // If a cycle is detected, exit the loop.
    } else {
      // If not visited, add the current value to the list of visited nodes.
      visitedNodes.push(currentValue);
    }
  }

  // After the loop, determine the output based on whether the target was found.
  if (foundTarget) {
    // If the target was found, output the total steps taken, including the final step to 2.
    console.log(stepCounter + 1);
  } else {
    // If the target was not found (due to a cycle or reaching the start without finding 2), output -1.
    console.log(-1);
  }
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
