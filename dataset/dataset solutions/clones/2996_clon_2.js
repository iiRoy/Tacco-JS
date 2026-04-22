'use strict';

/**
 * Processes grid movement commands and checks for path validity.
 * @param {string} rawInputData - The raw input string containing grid dimensions, start position, and movement sequences.
 */
function ProcessGridPath(rawInputData)
{
  // Split the input string into individual tokens based on whitespace.
  let parsedTokens = rawInputData.split(/\s+/);

  // Parse grid dimensions, total number of steps, and initial coordinates.
  const gridHeightValue = Number(parsedTokens.shift());    // Represents the height of the grid.
  const gridWidthValue  = Number(parsedTokens.shift());     // Represents the width of the grid.
  const totalStepsCount = Number(parsedTokens.shift());   // The total number of movement steps to analyze.

  const initialRowPos   = Number(parsedTokens.shift());   // The starting row position.
  const initialColPos   = Number(parsedTokens.shift());   // The starting column position.

  const playerMovements   = parsedTokens.shift();       // Sequence of player's intended moves (e.g., 'L', 'R', 'U', 'D').
  const restrictionMoves  = parsedTokens.shift();      // Sequence of environmental restrictions (e.g., 'L', 'R', 'U', 'D').

  // Initialize a data structure to store the boundaries of the reachable area at each step.
  // Each element represents a step and contains: [minimumColumn, maximumColumn, minimumRow, maximumRow].
  // The first element corresponds to the initial state, where the reachable area is just the starting point.
  let pathBoundaries = [[initialColPos, initialColPos, initialRowPos, initialRowPos]];

  // Iterate through each movement step from 0 up to (but not including) totalStepsCount.
  for (let currentStep = 0; currentStep < totalStepsCount; ++currentStep)
  {
    // Initialize the boundary array for the next step.
    pathBoundaries[currentStep + 1] = [];

    // Calculate the potential new boundaries based solely on the player's movement for the current step.
    // minCol (index 0): Decreases if player moves Left.
    pathBoundaries[currentStep + 1][0] = pathBoundaries[currentStep][0] - (playerMovements[currentStep] === 'L' ? 1 : 0);
    // maxCol (index 1): Increases if player moves Right.
    pathBoundaries[currentStep + 1][1] = pathBoundaries[currentStep][1] + (playerMovements[currentStep] === 'R' ? 1 : 0);
    // minRow (index 2): Decreases if player moves Up.
    pathBoundaries[currentStep + 1][2] = pathBoundaries[currentStep][2] - (playerMovements[currentStep] === 'U' ? 1 : 0);
    // maxRow (index 3): Increases if player moves Down.
    pathBoundaries[currentStep + 1][3] = pathBoundaries[currentStep][3] + (playerMovements[currentStep] === 'D' ? 1 : 0);

    // After applying player moves, check if the reachable area has extended beyond the grid limits.
    // If minCol becomes 0, it means the area is outside column 1.
    // If maxCol becomes gridWidthValue + 1, it means the area is outside column gridWidthValue.
    // If minRow becomes 0, it means the area is outside row 1.
    // If maxRow becomes gridHeightValue + 1, it means the area is outside row gridHeightValue.
    // If any of these conditions are met, the path is impossible.
    if (pathBoundaries[currentStep + 1][0] === 0 || pathBoundaries[currentStep + 1][1] === gridWidthValue + 1 ||
        pathBoundaries[currentStep + 1][2] === 0 || pathBoundaries[currentStep + 1][3] === gridHeightValue + 1)
    {
      console.log('NO'); // Output 'NO' for an invalid path.
      return;            // Terminate execution immediately.
    }

    // Now, apply the environmental restrictions to the boundaries.
    // The original logic uses `pathBoundaries[currentStep + 1][0]` as a base for all subsequent updates within this step,
    // which may appear to be a logical flaw but is replicated precisely as per Type II cloning requirements.

    // Update minCol boundary: A 'R' restriction allows movement from the right, effectively shrinking the minCol.
    // Also, ensure minCol does not exceed gridWidthValue.
    pathBoundaries[currentStep + 1][0] = Math.min(pathBoundaries[currentStep + 1][0] + (restrictionMoves[currentStep] === 'R' ? 1 : 0), gridWidthValue);

    // Update maxCol boundary: A 'L' restriction allows movement from the left, effectively shrinking the maxCol.
    // Ensure maxCol is at least 1. Note the use of `pathBoundaries[currentStep + 1][0]` as per original.
    pathBoundaries[currentStep + 1][1] = Math.max(pathBoundaries[currentStep + 1][0] - (restrictionMoves[currentStep] === 'L' ? 1 : 0), 1);

    // Update minRow boundary: A 'D' restriction allows movement from below, effectively shrinking the minRow.
    // Ensure minRow does not exceed gridHeightValue. Note the use of `pathBoundaries[currentStep + 1][0]` as per original.
    pathBoundaries[currentStep + 1][2] = Math.min(pathBoundaries[currentStep + 1][0] + (restrictionMoves[currentStep] === 'D' ? 1 : 0), gridHeightValue);

    // Update maxRow boundary: An 'U' restriction allows movement from above, effectively shrinking the maxRow.
    // Ensure maxRow is at least 1. Note the use of `pathBoundaries[currentStep + 1][0]` as per original.
    pathBoundaries[currentStep + 1][3] = Math.max(pathBoundaries[currentStep + 1][0] - (restrictionMoves[currentStep] === 'U' ? 1 : 0), 1);
  }

  // If the program reaches this point, it means the path was valid through all steps.
  console.log('YES'); // Output 'YES' for a valid path.
}

// Read input from standard input using Node.js 'fs' module and invoke the processing function.
ProcessGridPath(require('fs').readFileSync('/dev/stdin', 'utf8'));