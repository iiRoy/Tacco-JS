var allInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  allInputData += chunk;
});
process.stdin.on('end', function () {
  processGameRounds(allInputData.split('\n'));
});

const movementDirections = {
  'N': { deltaX: 0, deltaY: 1 },
  'E': { deltaX: 1, deltaY: 0 },
  'S': { deltaX: 0, deltaY: -1 },
  'W': { deltaX: -1, deltaY: 0 }
};

function checkAllGemsCollected(initialGemPositions, movementSequence) {
  let currentGemSet = new Set(initialGemPositions);

  let currentAgentX = 10;
  let currentAgentY = 10;

  movementSequence.forEach(instruction => {
    const { directionKey, stepCount } = instruction;
    const { deltaX, deltaY } = movementDirections[directionKey];

    for (let step = 0; step < stepCount; step++) {
      currentAgentX += deltaX;
      currentAgentY += deltaY;
      const currentCoordinateString = `${currentAgentX},${currentAgentY}`;

      if (currentGemSet.has(currentCoordinateString)) {
        currentGemSet.delete(currentCoordinateString);
      }
    }
  });

  return currentGemSet.size === 0;
}

function processGameRounds(inputLines) {
  let linePointer = 0;
  let gemCount;

  while ((gemCount = Number(inputLines[linePointer++])) !== 0) {
    const gemLocations = new Set();

    for (let g = 0; g < gemCount; g++) {
      const parts = inputLines[linePointer++].split(' ');
      gemLocations.add(`${parts[0]},${parts[1]}`);
    }

    const instructionCount = Number(inputLines[linePointer++]);
    const movementInstructions = [];

    for (let m = 0; m < instructionCount; m++) {
      const parts = inputLines[linePointer++].split(' ');
      movementInstructions.push({ directionKey: parts[0], stepCount: Number(parts[1]) });
    }

    const result = checkAllGemsCollected(gemLocations, movementInstructions);
    console.log(result ? 'Yes' : 'No');
  }
}
