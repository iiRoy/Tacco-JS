let allRawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (piece) => {
  allRawData += piece;
});

process.stdin.on('end', () => {
  const lineSegments = allRawData.split('\n');
  processGameRounds(lineSegments, 0);
});

const displacementVectors = {
  'N': [0, 1],
  'E': [1, 0],
  'S': [0, -1],
  'W': [-1, 0]
};

const evaluateOutcome = (initialTreasures, movementInstructions) => {
  const visitedCoordinates = new Set();
  
  let currentXCoordinate = 10;
  let currentYCoordinate = 10;

  movementInstructions.forEach(instruction => {
    const [deltaX, deltaY] = displacementVectors[instruction.motion];

    for (let currentStep = 0; currentStep < instruction.amount; currentStep++) {
      currentXCoordinate += deltaX;
      currentYCoordinate += deltaY;
      visitedCoordinates.add(`${currentXCoordinate}_${currentYCoordinate}`);
    }
  });

  const allCollected = [...initialTreasures].every(treasureCoord => 
    visitedCoordinates.has(treasureCoord)
  );

  return allCollected;
};

const processGameRounds = (lineSegments, currentLinePointer) => {
  const gemCounter = Number(lineSegments[currentLinePointer++]);

  if (gemCounter === 0) {
    return;
  }

  const gemPositions = new Set();
  for (let idx = 0; idx < gemCounter; idx++) {
    const coords = lineSegments[currentLinePointer++].split(' ').map(Number);
    gemPositions.add(`${coords[0]}_${coords[1]}`);
  }

  const commandCount = Number(lineSegments[currentLinePointer++]);
  const gameCommands = [];
  for (let idx = 0; idx < commandCount; idx++) {
    const commandParts = lineSegments[currentLinePointer++].split(' ');
    gameCommands.push({
      motion: commandParts[0],
      amount: Number(commandParts[1])
    });
  }

  if (evaluateOutcome(gemPositions, gameCommands)) {
    console.log('Yes');
  } else {
    console.log('No');
  }

  processGameRounds(lineSegments, currentLinePointer);
};