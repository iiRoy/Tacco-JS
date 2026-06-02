'use strict';

// This function computes a specific path sequence based on start and end coordinates.
function calculatePath(inputStr) {
  // Process the raw input string into an array of numbers.
  let coordinateValues = inputStr
    .trim() // Remove leading/trailing whitespace.
    .split(' ') // Split by space to get individual coordinate strings.
    .map(Number); // Convert each string to a number.

  // Extract the individual coordinate components.
  const startCoordX = coordinateValues[0];
  const startCoordY = coordinateValues[1];
  const endCoordX = coordinateValues[2];
  const endCoordY = coordinateValues[3];

  // Calculate the differences in coordinates.
  const diffX = endCoordX - startCoordX;
  const diffY = endCoordY - startCoordY;

  // Initialize an empty string to build the movement sequence.
  let movementSequence = '';

  // First segment: Move Up
  for (let loopIndex = 0; loopIndex <= diffY; loopIndex++) {
    movementSequence += 'U';
  }
  // Second segment: Move Right
  for (let loopIndex = 0; loopIndex <= diffX; loopIndex++) {
    movementSequence += 'R';
  }

  // Third segment: Move Down
  for (let loopIndex = 0; loopIndex <= diffY; loopIndex++) {
    movementSequence += 'D';
  }
  // Fourth segment: Move Left
  for (let loopIndex = 0; loopIndex <= diffX; loopIndex++) {
    movementSequence += 'L';
  }

  // Fifth segment: Specific sequence
  movementSequence += 'L';
  for (let loopIndex = 0; loopIndex <= diffY + 1; loopIndex++) {
    movementSequence += 'U';
  }
  for (let loopIndex = 0; loopIndex <= diffX + 1; loopIndex++) {
    movementSequence += 'R';
  }
  movementSequence += 'DR';
  for (let loopIndex = 0; loopIndex <= diffY + 1; loopIndex++) {
    movementSequence += 'D';
  }
  for (let loopIndex = 0; loopIndex <= diffX + 1; loopIndex++) {
    movementSequence += 'L';
  }
  movementSequence += 'U';

  // Output the final calculated movement sequence to the console.
  console.log(movementSequence);
}

// Read input from standard input and pass it to the main processing function.
calculatePath(require('fs').readFileSync('/dev/stdin', 'utf8'));
