var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  input += chunk;
});
process.stdin.on('end', function () {
  initiateGameSimulation(input.split('\n'));
});

function initiateGameSimulation(inputLines) {
  const startingRobotX = 10;
  const startingRobotY = 10;

  let currentInputLinePointer = 0;

  // Recursive function to process each game round
  const processNextScenario = () => {
    const gemCountString = inputLines[currentInputLinePointer++];
    const numberOfGems = parseInt(gemCountString, 10);

    if (numberOfGems === 0) {
      return; // Termination condition for the recursive processing
    }

    // Using a Set to store unique gem coordinates as strings "x,y"
    const existingGemCoordinates = new Set();

    for (let gemIndex = 0; gemIndex < numberOfGems; gemIndex++) {
      const gemPositionLine = inputLines[currentInputLinePointer++];
      const gemComponents = gemPositionLine.split(' ');
      console.log(gemComponents); // Preserve original debug output
      existingGemCoordinates.add(`${parseInt(gemComponents[0], 10)},${parseInt(gemComponents[1], 10)}`);
    }

    const moveCountString = inputLines[currentInputLinePointer++];
    const numberOfMoves = parseInt(moveCountString, 10);
    const movementInstructions = [];

    for (let moveIndex = 0; moveIndex < numberOfMoves; moveIndex++) {
      const moveDescriptionLine = inputLines[currentInputLinePointer++];
      const [directionChar, lengthString] = moveDescriptionLine.split(' ');
      movementInstructions.push({ directionKey: directionChar, stepCount: parseInt(lengthString, 10) });
    }

    // Evaluate if all gems are collected
    const allCollected = assessCollectionStatus(
      new Set(existingGemCoordinates), // Pass a copy to avoid modifying the original set if needed elsewhere
      movementInstructions,
      startingRobotX,
      startingRobotY
    );

    console.log(allCollected ? 'Yes' : 'No');

    processNextScenario(); // Recurse for the next game scenario
  };

  processNextScenario(); // Start the first scenario
}

function assessCollectionStatus(remainingGemSet, movementPath, initialX, initialY) {
  let currentPositionX = initialX;
  let currentPositionY = initialY;

  // Lookup table for directional vectors
  const directionalVectors = {
    'N': { deltaX: 0, deltaY: 1 },
    'S': { deltaX: 0, deltaY: -1 },
    'E': { deltaX: 1, deltaY: 0 },
    'W': { deltaX: -1, deltaY: 0 }
  };

  // Iterate through each segment of the movement path
  movementPath.forEach(segment => {
    const { directionKey, stepCount } = segment;
    const { deltaX, deltaY } = directionalVectors[directionKey];

    // Move step by step, collecting gems
    for (let s = 0; s < stepCount; s++) {
      currentPositionX += deltaX;
      currentPositionY += deltaY;
      remainingGemSet.delete(`${currentPositionX},${currentPositionY}`);
    }
  });

  // If the set of remaining gems is empty, all were collected
  return remainingGemSet.size === 0;
}
