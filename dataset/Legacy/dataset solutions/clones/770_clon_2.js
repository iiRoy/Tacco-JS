let rawInputData = ''; // Stores all incoming data from standard input.

// Set up standard input to receive data.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', function (dataChunk) {
  rawInputData += dataChunk; // Append each chunk to the raw input string.
});

// Event listener for 'end' of stdin input.
process.stdin.on('end', function () {
  // Once all input is received, split it by newline and pass to the main processing function.
  processGameData(rawInputData.split('\n'));
});

/**
 * Processes the game data line by line to determine if all gems are collected.
 * @param {string[]} inputLines - An array of strings, each representing a line of input.
 */
function processGameData(inputLines) {
  let loopIndex; // General purpose loop counter.
  let currentLineParts; // Temporary array for split line parts.
  let numberOfGems; // Number of gems for the current game scenario.
  let gameGrid; // The 21x21 grid representing the game board.
  let numberOfMoves; // Number of moves the player makes.
  let movementInstructions = []; // Array to store player movement commands.

  // Loop through game scenarios until a '0' is encountered for the number of gems.
  while ((numberOfGems = +inputLines.shift()) !== 0) {
    // Initialize the game grid (21x21 = 441 cells) with all zeros.
    gameGrid = new Array(21 * 21);
    for (loopIndex = 0; loopIndex < 21 * 21; loopIndex++) {
      gameGrid[loopIndex] = 0; // 0 indicates an empty cell or no gem.
    }

    // Read gem positions and mark them on the grid.
    loopIndex = 0;
    while (loopIndex < numberOfGems) {
      currentLineParts = inputLines.shift().split(' '); // Get gem coordinates.
      // Mark the cell with a gem (1 indicates a gem).
      gameGrid[(+currentLineParts[0]) + 21 * (+currentLineParts[1])] = 1;
      loopIndex++;
    }

    // Read the number of movement instructions.
    numberOfMoves = +inputLines.shift();
    loopIndex = 0;
    // Read each movement instruction.
    while (loopIndex < numberOfMoves) {
      currentLineParts = inputLines.shift().split(' '); // Get direction and length.
      // Store the move as an object with direction and length.
      movementInstructions.push({ directionChar: currentLineParts[0], lengthOfMove: +currentLineParts[1] });
      loopIndex++;
    }

    // Determine if all gems were collected based on the current game state and moves.
    // Output "Yes" if all gems are collected, "No" otherwise.
    checkAllGemsCollected(gameGrid, movementInstructions) ? console.log('Yes') : console.log('No');
  }
}

/**
 * Checks if all gems on the game grid have been collected after applying the given moves.
 * @param {number[]} gameGrid - The 21x21 game grid with gem locations (1 for gem, 0 for empty).
 * @param {Array<{directionChar: string, lengthOfMove: number}>} movementInstructions - An array of movement commands.
 * @returns {boolean} - True if all gems are collected, false otherwise.
 */
function checkAllGemsCollected(gameGrid, movementInstructions) {
  // Starting position of the player (center of a 21x21 grid, 10,10).
  let currentPosition = 10 + 10 * 21;
  let loopCounter; // Loop counter for iterating through move lengths.
  let stepDirection; // Value to add to currentPosition for each step.

  // Apply each movement instruction.
  movementInstructions.forEach(function (currentMove) {
    // Determine the step value based on the direction character.
    switch (currentMove.directionChar) {
      case 'N': // North: move up one row (subtract 21 from index).
        stepDirection = -21;
        break;
      case 'W': // West: move left one column (subtract 1 from index).
        stepDirection = -1;
        break;
      case 'E': // East: move right one column (add 1 to index).
        stepDirection = 1;
        break;
      case 'S': // South: move down one row (add 21 to index).
        stepDirection = 21;
        break;
    }

    // Execute the move for its specified length.
    for (loopCounter = 0; loopCounter < currentMove.lengthOfMove; loopCounter++) {
      currentPosition += stepDirection; // Update player's position.
      gameGrid[currentPosition] = 0; // Mark the cell as visited (gem collected if present).
    }
  });

  // After all moves, check if any gems remain on the grid.
  for (loopCounter = 0; loopCounter < 21 * 21; loopCounter++) {
    if (gameGrid[loopCounter] === 1) {
      // If any cell still contains a gem (value 1), not all gems were collected.
      return false;
    }
  }
  // If the loop completes, all gems have been collected.
  return true;
}
