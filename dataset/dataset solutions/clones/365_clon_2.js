function explorePath(currentX, currentY, depthLevel) {
  // Update the maximum depth reached so far.
  maximumDepthReached = Math.max(maximumDepthReached, depthLevel);

  // If the maximum depth has reached the target, we can stop exploring this path.
  if (maximumDepthReached === targetDepth) {
    return;
  }

  // Define relative offsets for potential next moves.
  // These represent a specific "bomb" movement pattern.
  const deltaXOffsets = [-1, 0, 1, -2, 2, -2, 2, -2, 2, -1, 0, 1];
  const deltaYOffsets = [-2, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 2];

  // Create a set of "safe" coordinates around the current water location.
  // These are the 3x3 grid centered on the water source at the current depth.
  const safeZones = {};
  for (let idx = -1; idx <= 1; idx++) {
    for (let jdx = -1; jdx <= 1; jdx++) {
      safeZones[(waterLocations[depthLevel * 2] + idx) + " " + (waterLocations[depthLevel * 2 + 1] + jdx)] = true;
    }
  }

  // Iterate through all possible next moves.
  for (let moveIndex = 0; moveIndex < 12; moveIndex++) {
    const nextX = currentX + deltaXOffsets[moveIndex];
    const nextY = currentY + deltaYOffsets[moveIndex];

    // Check if the next coordinates are within the 10x10 grid boundaries.
    if (nextX < 0 || nextY < 0 || nextX >= 10 || nextY >= 10) {
      continue; // Skip if out of bounds.
    }

    // If the next position is within a "safe zone", recursively explore from there.
    if (safeZones.hasOwnProperty(nextX + " " + nextY)) {
      explorePath(nextX, nextY, depthLevel + 1);
    }
  }
}

// Import the file system module to read input.
const fileSystem = require('fs');
// Read all input from standard input and process it.
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

// Global variables to maintain state across recursive calls and main loop.
let maximumDepthReached;
let targetDepth;
let waterLocations;

// Process input lines until a termination condition is met.
while (true) {
  // Read the starting coordinates for the current test case.
  const startCoords = inputLines.shift().split(" ").map(Number);

  // If both coordinates are zero, it's the end of input.
  if (startCoords[0] === 0 && startCoords[1] === 0) {
    break;
  }

  // Read the target depth for the current test case.
  targetDepth = Number(inputLines.shift()); // Convert to number explicitly.

  // Read the water locations for the current test case.
  waterLocations = inputLines.shift().split(" ").map(Number);

  // Initialize the maximum depth reached for this test case.
  maximumDepthReached = 0;

  // Start the recursive exploration from the initial coordinates at depth 0.
  explorePath(startCoords[0], startCoords[1], 0);

  // Output the result based on whether the target depth was reached.
  console.log((maximumDepthReached === targetDepth) ? "OK" : "NA");
}
