(function(inputData) {
  const parseInputLines = (rawData) => rawData.trim().split('\n');
  let inputLines = parseInputLines(inputData);

  const readNextTrimmedLine = () => inputLines.shift().trim();

  const readNextNumber = () => Number(readNextTrimmedLine());

  const generatePositionKey = (coordX, coordY) => `${coordX} ${coordY}`;

  while (true) {
    const currentLine = readNextTrimmedLine();

    if (currentLine === '0') {
      break;
    }

    const numJewels = Number(currentLine);
    const jewelLocations = {};

    for (let jewelIdx = 0; jewelIdx < numJewels; jewelIdx++) {
      const jewelCoordKey = readNextTrimmedLine();
      jewelLocations[jewelCoordKey] = 1;
    }

    const numMoves = readNextNumber();

    let currentX = 10;
    let currentY = 10;

    const directionVectors = {
      'N': [0, 1],
      'S': [0, -1],
      'E': [1, 0],
      'W': [-1, 0]
    };

    let collectedJewelsCount = 0;

    for (let moveIdx = 0; moveIdx < numMoves; moveIdx++) {
      const moveOperationString = readNextTrimmedLine();
      const moveOperationParts = moveOperationString.split(' ');

      const moveDirection = moveOperationParts[0];
      const moveSteps = Number(moveOperationParts[1]);

      const [deltaX, deltaY] = directionVectors[moveDirection];

      for (let stepCounter = 0; stepCounter < moveSteps; stepCounter++) {
        currentX += deltaX;
        currentY += deltaY;

        const currentPositionKey = generatePositionKey(currentX, currentY);

        if (jewelLocations[currentPositionKey] === 1) {
          collectedJewelsCount++;
          jewelLocations[currentPositionKey] = 0;
        }
      }
    }

    console.log(collectedJewelsCount === numMoves ? 'Yes' : 'No');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
