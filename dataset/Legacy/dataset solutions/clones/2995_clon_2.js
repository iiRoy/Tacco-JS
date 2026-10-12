'use strict';

/**
 * Processes grid movement instructions to determine if a player can avoid obstacles.
 * This function simulates the movement of a player's possible reachable area
 * and an obstacle's movement, checking for collisions or out-of-bounds conditions.
 *
 * @param {string} rawData - A string containing space-separated input values:
 *                           H W N sr sc S T
 *                           H: grid height
 *                           W: grid width
 *                           N: number of moves
 *                           sr: starting row of the player
 *                           sc: starting column of the player
 *                           S: string of player's moves (L, R, U, D)
 *                           T: string of obstacle's moves (L, R, U, D)
 */
function ProcessGridMoves(rawData) {
  // Split the input string by whitespace to get individual values.
  let parsedInputs = rawData.split(/\s+/);

  // Extract grid dimensions and initial player position.
  // The `- 0` converts string to number.
  const gridHeight = parsedInputs.shift() - 0;
  const gridWidth = parsedInputs.shift() - 0;
  const numMoves = parsedInputs.shift() - 0;
  const startRow = parsedInputs.shift() - 0;
  const startCol = parsedInputs.shift() - 0;

  // Extract player and obstacle movement sequences.
  const playerMoves = parsedInputs.shift();
  const obstacleMoves = parsedInputs.shift();

  // Initialize an array to store the boundaries of the reachable area at each step.
  // Each element is [minColumn, maxColumn, minRow, maxRow].
  // Initially, the reachable area is just the starting point.
  let reachableAreaBounds = [[startCol, startCol, startRow, startRow]];

  // Iterate through each movement step.
  for (let moveIndex = 0; moveIndex < numMoves; moveIndex++) {
    // Create a new entry for the next step's boundaries.
    reachableAreaBounds[moveIndex + 1] = [];

    // Calculate the potential new boundaries after the player's move.
    // minColumn: Decreases if player moves Left.
    reachableAreaBounds[moveIndex + 1][0] = reachableAreaBounds[moveIndex][0] - (playerMoves[moveIndex] === 'L' ? 1 : 0);
    // maxColumn: Increases if player moves Right.
    reachableAreaBounds[moveIndex + 1][1] = reachableAreaBounds[moveIndex][1] + (playerMoves[moveIndex] === 'R' ? 1 : 0);
    // minRow: Decreases if player moves Up.
    reachableAreaBounds[moveIndex + 1][2] = reachableAreaBounds[moveIndex][2] - (playerMoves[moveIndex] === 'U' ? 1 : 0);
    // maxRow: Increases if player moves Down.
    reachableAreaBounds[moveIndex + 1][3] = reachableAreaBounds[moveIndex][3] + (playerMoves[moveIndex] === 'D' ? 1 : 0);

    // Check if the player's reachable area goes out of bounds (1 to W/H).
    // If minColumn becomes 0 (left of grid), maxColumn becomes W+1 (right of grid),
    // minRow becomes 0 (above grid), or maxRow becomes H+1 (below grid),
    // then the player cannot survive.
    if (
      reachableAreaBounds[moveIndex + 1][0] === 0 ||
      reachableAreaBounds[moveIndex + 1][1] === gridWidth + 1 ||
      reachableAreaBounds[moveIndex + 1][2] === 0 ||
      reachableAreaBounds[moveIndex + 1][3] === gridHeight + 1
    ) {
      console.log('NO'); // Player cannot survive.
      return;            // Exit the function.
    }

    // Now, adjust the boundaries based on the obstacle's movement.
    // The obstacle restricts the player's movement, effectively shrinking the reachable area.

    // minColumn: If obstacle moves Right, the minimum reachable column increases.
    // Also, ensure it doesn't exceed the gridWidth.
    reachableAreaBounds[moveIndex + 1][0] = Math.min(
      reachableAreaBounds[moveIndex + 1][0] + (obstacleMoves[moveIndex] === 'R' ? 1 : 0),
      gridWidth
    );

    // maxColumn: If obstacle moves Left, the maximum reachable column decreases.
    // Also, ensure it doesn't go below 1.
    reachableAreaBounds[moveIndex + 1][1] = Math.max(
      reachableAreaBounds[moveIndex + 1][1] - (obstacleMoves[moveIndex] === 'L' ? 1 : 0),
      1
    );

    // minRow: If obstacle moves Down, the minimum reachable row increases.
    // Also, ensure it doesn't exceed the gridHeight.
    reachableAreaBounds[moveIndex + 1][2] = Math.min(
      reachableAreaBounds[moveIndex + 1][2] + (obstacleMoves[moveIndex] === 'D' ? 1 : 0),
      gridHeight
    );

    // maxRow: If obstacle moves Up, the maximum reachable row decreases.
    // Also, ensure it doesn't go below 1.
    reachableAreaBounds[moveIndex + 1][3] = Math.max(
      reachableAreaBounds[moveIndex + 1][3] - (obstacleMoves[moveIndex] === 'U' ? 1 : 0),
      1
    );
  }

  // If the loop completes without the player going out of bounds,
  // it means the player can survive.
  console.log('YES');
}

// Read input from standard input and pass it to the main processing function.
ProcessGridMoves(require('fs').readFileSync('/dev/stdin', 'utf8'));
