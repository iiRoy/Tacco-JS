var globalDimension = 0;

/**
 * Processes the entire input data to simulate tile movements.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
  // Split the input string into individual lines.
  const inputLines = rawData.split('\n');

  // Parse the first line to get the dimension and number of queries (though queries count isn't used directly).
  const dimensionAndQueries = inputLines[0].split(' ');
  globalDimension = parseInt(dimensionAndQueries[0]);

  // A map to store the initial positions of each character.
  const charPositionMap = {};
  // An array to hold the count of tiles at each position.
  var tileCounts = [];

  // Initialize tile counts and character position map based on the second input line.
  for (var charIdx = 0; charIdx < inputLines[1].length; charIdx++) {
    var currentChr = inputLines[1][charIdx];
    tileCounts[charIdx] = 1; // Each initial position has one tile.

    // If this character hasn't been seen before, create an entry for it.
    if (!charPositionMap[currentChr]) {
      charPositionMap[currentChr] = [];
    }
    // Record the current index for this character.
    charPositionMap[currentChr].push(charIdx);
  }

  // Iterate through the remaining input lines, which represent movement queries.
  for (var queryIdx = 2; queryIdx < inputLines.length; queryIdx++) {
    var queryParts = inputLines[queryIdx].split(' ');
    var targetChar = queryParts[0]; // The character to move.
    var charPositions = charPositionMap[targetChar]; // Get all current positions of this character.

    // If the character is no longer on the board (or never was), skip this query.
    if (!charPositions) {
      continue;
    }

    var moveDirection = queryParts[1]; // The direction to move ('R' for right, 'L' for left).

    // If moving right, process positions from right to left to avoid issues with shifting.
    if (moveDirection === "R") {
      for (var reverseIdx = (charPositions.length - 1); reverseIdx >= 0; reverseIdx--) {
        shiftTile(tileCounts, charPositions[reverseIdx], 1); // Move one step to the right.
      }
    } else { // Moving left.
      // Process positions from left to right.
      for (var forwardIdx = 0; forwardIdx < charPositions.length; forwardIdx++) {
        shiftTile(tileCounts, charPositions[forwardIdx], -1); // Move one step to the left.
      }
    }
  }

  // Calculate the total number of tiles remaining on the board.
  var totalTiles = 0;
  tileCounts.forEach(individualCount => totalTiles += individualCount);

  // Output the final sum.
  console.log(totalTiles);
}

/**
 * Moves tiles from one position to another.
 * @param {number[]} tileCounts - The array representing tile counts at each position.
 * @param {number} currentPos - The current index of the tiles to move.
 * @param {number} shiftAmount - The amount and direction to shift (e.g., 1 for right, -1 for left).
 */
function shiftTile(tileCounts, currentPos, shiftAmount) {
  var newPos = currentPos + shiftAmount;
  var tileQuantity = tileCounts[currentPos]; // Get the number of tiles at the current position.

  tileCounts[currentPos] = 0; // Clear the tiles from the current position.

  // If the new position is outside the board boundaries, the tiles fall off.
  if (newPos < 0 || newPos >= globalDimension) {
    return;
  }

  // Add the moved tiles to the new position.
  tileCounts[newPos] += tileQuantity;
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
