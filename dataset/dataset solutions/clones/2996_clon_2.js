'use strict';

/**
 * Analyzes a sequence of movements and obstacles on a grid to determine
 * if a path exists from a starting point, considering dynamic boundaries.
 *
 * @param {string} rawInputData - A string containing space-separated values:
 *   grid height, grid width, number of steps, start row, start column,
 *   player movement string, and obstacle movement string.
 */
function ProcessGridPath(rawInputData) {
  // Parse the input string into an array of tokens.
  let tokenizedInput = rawInputData.split(/\s+/);

  // Extract grid dimensions and initial coordinates, converting them to numbers.
  const gridHeightDimension = tokenizedInput.shift() - 0;
  const gridWidthDimension = tokenizedInput.shift() - 0;
  const totalMovementSteps = tokenizedInput.shift() - 0;

  const initialRowPosition = tokenizedInput.shift() - 0;
  const initialColumnPosition = tokenizedInput.shift() - 0;

  // Extract the movement sequences for the player and obstacles.
  const playerMovementSequence = tokenizedInput.shift();
  const obstacleMovementSequence = tokenizedInput.shift();

  // Initialize an array to store the possible range of positions at each step.
  // Each sub-array holds [minimum_column, maximum_column, minimum_row, maximum_row].
  // Initially, the range is just the starting point.
  const currentPossibleRanges = [[initialColumnPosition, initialColumnPosition, initialRowPosition, initialRowPosition]];

  // Iterate through each step of the movement sequences.
  for (let currentStepIndex = 0; currentStepIndex < totalMovementSteps; currentStepIndex++) {
    // Prepare a new entry for the next step's possible ranges.
    currentPossibleRanges[currentStepIndex + 1] = [];

    // Calculate the potential range after the player's move (S).
    // 'L' decreases min_col, 'R' increases max_col, 'U' decreases min_row, 'D' increases max_row.
    currentPossibleRanges[currentStepIndex + 1][0] = currentPossibleRanges[currentStepIndex][0] - (playerMovementSequence[currentStepIndex] === 'L' ? 1 : 0);
    currentPossibleRanges[currentStepIndex + 1][1] = currentPossibleRanges[currentStepIndex][1] + (playerMovementSequence[currentStepIndex] === 'R' ? 1 : 0);
    currentPossibleRanges[currentStepIndex + 1][2] = currentPossibleRanges[currentStepIndex][2] - (playerMovementSequence[currentStepIndex] === 'U' ? 1 : 0);
    currentPossibleRanges[currentStepIndex + 1][3] = currentPossibleRanges[currentStepIndex][3] + (playerMovementSequence[currentStepIndex] === 'D' ? 1 : 0);

    // Check if the potential range has gone outside the grid boundaries (1 to W/H).
    // If any boundary is 0 (left/top edge crossed) or W+1/H+1 (right/bottom edge crossed),
    // then a path is impossible.
    if (currentPossibleRanges[currentStepIndex + 1][0] === 0 ||
        currentPossibleRanges[currentStepIndex + 1][1] === gridWidthDimension + 1 ||
        currentPossibleRanges[currentStepIndex + 1][2] === 0 ||
        currentPossibleRanges[currentStepIndex + 1][3] === gridHeightDimension + 1)
    {
      console.log('NO'); // Output 'NO' and terminate.
      return;
    }

    // Apply the constraints from the obstacle's move (T) to shrink the possible range.
    // 'R' obstacle means min_col must increase (blocks leftward movement).
    currentPossibleRanges[currentStepIndex + 1][0] = Math.min(currentPossibleRanges[currentStepIndex + 1][0] + (obstacleMovementSequence[currentStepIndex] === 'R' ? 1 : 0), gridWidthDimension);

    // 'L' obstacle means max_col must decrease (blocks rightward movement).
    // NOTE: The original code uses the updated minimum column (index 0) here,
    // instead of the maximum column (index 1). This behavior is preserved.
    currentPossibleRanges[currentStepIndex + 1][1] = Math.max(currentPossibleRanges[currentStepIndex + 1][0] - (obstacleMovementSequence[currentStepIndex] === 'L' ? 1 : 0), 1);

    // 'D' obstacle means min_row must increase (blocks upward movement).
    // NOTE: The original code uses the updated minimum column (index 0) here,
    // instead of the minimum row (index 2). This behavior is preserved.
    currentPossibleRanges[currentStepIndex + 1][2] = Math.min(currentPossibleRanges[currentStepIndex + 1][0] + (obstacleMovementSequence[currentStepIndex] === 'D' ? 1 : 0), gridHeightDimension);

    // 'U' obstacle means max_row must decrease (blocks downward movement).
    // NOTE: The original code uses the updated minimum column (index 0) here,
    // instead of the maximum row (index 3). This behavior is preserved.
    currentPossibleRanges[currentStepIndex + 1][3] = Math.max(currentPossibleRanges[currentStepIndex + 1][0] - (obstacleMovementSequence[currentStepIndex] === 'U' ? 1 : 0), 1);
  }

  // If the loop completes without an early exit, a path is possible.
  console.log('YES');
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessGridPath(require('fs').readFileSync('/dev/stdin', 'utf8'));
