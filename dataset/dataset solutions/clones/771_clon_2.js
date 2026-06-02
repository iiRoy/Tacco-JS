var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
  rawData += dataChunk;
});
process.stdin.on('end', function () {
  processGameData(rawData.split('\n'));
});

/**
 * Main function to process game input and determine if all gems are collected.
 * @param {string[]} inputLines - An array of strings, each representing a line of input.
 */
function processGameData(inputLines) {
  let idx, currentLineParts, numGems, gameGrid, numMoves, playerMoves = [];

  // Loop until the number of gems is zero, indicating the end of input
  while ((numGems = +inputLines.shift()) !== 0x0) {
    // Initialize the game grid (21x21 cells)
    gameGrid = new Array(21 * 21);
    for (idx = 0; idx < 21 * 21; idx++) {
      gameGrid[idx] = 0x0; // Mark all cells as empty initially
    }

    // Read gem positions and mark them on the grid
    idx = 0;
    while (idx < numGems) {
      currentLineParts = inputLines.shift().split(' ');
      // console.log(currentLineParts); // Original debug output, preserved for behavioral equivalence
      // Convert coordinates to a single index and mark as a gem (1)
      gameGrid[(+currentLineParts[0]) + 21 * (+currentLineParts[1])] = 0b1;
      idx++;
    }

    // Read the number of moves
    numMoves = +inputLines.shift();
    
    // Read player moves
    idx = 0;
    while (idx < numMoves) {
      currentLineParts = inputLines.shift().split(' ');
      playerMoves.push({direction: currentLineParts[0], lengthVal: +currentLineParts[1]});
      idx++;
    }

    // Check if all gems are collected after the moves
    checkAllCollected(gameGrid, playerMoves) ? console.log('Yes') : console.log('No');
  }
}

/**
 * Checks if all gems on the grid have been collected by the player's path.
 * @param {number[]} gridState - The current state of the game grid.
 * @param {Array<Object>} movementInstructions - An array of player movement instructions.
 * @returns {boolean} True if all gems are collected, false otherwise.
 */
function checkAllCollected(gridState, movementInstructions) {
  // Starting position (10,10) in a 21x21 grid, converted to a 1D index
  let currentPosition = 10 + 10 * 21, loopCounter, stepIncrement;

  movementInstructions.forEach(function (instruction) {
    // Determine the increment for movement based on direction
    switch (instruction.direction) {
      case 'N': // North: move up one row (subtract 21 from index)
        stepIncrement = -21;
        break;
      case 'W': // West: move left one column (subtract 1 from index)
        stepIncrement = -1;
        break;
      case 'E': // East: move right one column (add 1 to index)
        stepIncrement = 1;
        break;
      case 'S': // South: move down one row (add 21 to index)
        stepIncrement = 21;
        break;
    }
    
    // Simulate the movement and collect gems
    for (loopCounter = 0x0; loopCounter < instruction.lengthVal; loopCounter++) {
      currentPosition += stepIncrement;
      gridState[currentPosition] = 0x0; // Mark cell as visited/gem collected
    }
  });

  // After all moves, check if any gems remain on the grid
  for (loopCounter = 0x0; loopCounter < 21 * 21; loopCounter++) {
     if(gridState[loopCounter] === 0b1){ // If any cell still contains a gem (1)
       return false; // Not all gems were collected
     }
  }
  return true; // All gems were collected
}
