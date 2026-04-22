var rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (dataSegment) {
  rawData += dataSegment;
});

process.stdin.on('end', function () {
  processPuzzleData(rawData.split('\n'));
});

function processPuzzleData(puzzleLines) {
  let idx, currentLineParts, numJewels, gameGrid, numSteps;

  while ((numJewels = +puzzleLines.shift()) !== 0) {
    let actionList = []; // List of movement actions for current puzzle.

    gameGrid = new Array(21 * 21); // Create a 21x21 grid represented as a flat array.
    for (idx = 0; idx < 21 * 21; idx++) {
      gameGrid[idx] = false; // Initially, no jewels are present.
    }

    idx = 0;
    while (idx < numJewels) {
      currentLineParts = puzzleLines.shift().split(' '); // Read jewel coordinates.
      console.log(currentLineParts); // Display coordinates for debugging.
      gameGrid[(+currentLineParts[0]) + 21 * (+currentLineParts[1])] = true; // Place a jewel at the calculated grid index.
      idx++;
    }

    numSteps = +puzzleLines.shift(); // Get the total number of movement steps.
    idx = 0;
    while (idx < numSteps) {
      currentLineParts = puzzleLines.shift().split(' '); // Read movement details.
      actionList.push({directionChar: currentLineParts[0], lengthSteps: +currentLineParts[1]}); // Store move direction and distance.
      idx++;
    }

    checkCompletion(gameGrid, actionList) ? console.log('Yes') : console.log('No'); // Output result of completion check.
  }
}

function checkCompletion(gameGrid, actionList) {
  let currentGridPosition = 10 + 10 * 21, idx, stepDelta; // Starting position (center of the 21x21 grid).

  actionList.forEach(function (movementInstruction) {
    switch (movementInstruction.directionChar) {
      case 'N':
        stepDelta = 21; // North: move up one row.
        break;
      case 'W':
        stepDelta = -1; // West: move left one column.
        break;
      case 'E':
        stepDelta = 1; // East: move right one column.
        break;
      case 'S':
        stepDelta = -21; // South: move down one row.
        break;
    }
    for (idx = 0; idx < movementInstruction.lengthSteps; idx++) {
      currentGridPosition += stepDelta; // Update the current position.
      gameGrid[currentGridPosition] = false; // Mark the current cell as 'no jewel'.
    }
  });

  for (idx = 0; idx < 21 * 21; idx++) {
    if (gameGrid[idx] === true) { // Check if any jewels remain on the grid.
      return false; // If a jewel is found, not all were collected.
    }
  }
  return true; // All jewels were successfully collected.
}