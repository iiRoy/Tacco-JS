let receivedContent = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (portion) => {
  receivedContent += portion;
});
process.stdin.on('end', () => {
  const allLines = receivedContent.trim().split('\n');
  processAllScenarios(allLines);
});

function processAllScenarios(scenarioLines) {
  let linePointer = 0;

  const extractNumber = (str) => parseInt(str, 10);

  const directionalChanges = {
    '>': [0, 1],
    '<': [0, -1],
    'v': [1, 0],
    '^': [-1, 0]
  };

  function explorePath(currentYPosition, currentXPosition, gridStructure, previouslyVisited) {
    const currentPointKey = `${currentYPosition},${currentXPosition}`;

    if (previouslyVisited.has(currentPointKey)) {
      return { encounteredLoop: true };
    }

    previouslyVisited.add(currentPointKey);

    const pointSymbol = gridStructure.get(currentPointKey);

    if (pointSymbol === '.') {
      return { encounteredLoop: false, finalXCoordinate: currentXPosition, finalYCoordinate: currentYPosition };
    }

    const [deltaY, deltaX] = directionalChanges[pointSymbol];
    const nextYPosition = currentYPosition + deltaY;
    const nextXPosition = currentXPosition + deltaX;

    return explorePath(nextYPosition, nextXPosition, gridStructure, previouslyVisited);
  }

  while (true) {
    const dimensionDescription = scenarioLines[linePointer++].split(' ');
    const gridWidth = extractNumber(dimensionDescription[0]);
    const gridHeight = extractNumber(dimensionDescription[1]);

    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    const currentGridMap = new Map();
    for (let currentGridRow = 0; currentGridRow < gridHeight; ++currentGridRow) {
      const rowData = scenarioLines[linePointer++];
      for (let currentGridCol = 0; currentGridCol < gridWidth; ++currentGridCol) {
        currentGridMap.set(`${currentGridRow},${currentGridCol}`, rowData[currentGridCol]);
      }
    }

    const initialY = 0;
    const initialX = 0;
    const visitedCoordinates = new Set();

    const pathResult = explorePath(initialY, initialX, currentGridMap, visitedCoordinates);

    if (pathResult.encounteredLoop) {
      console.log('LOOP');
    } else {
      console.log(`${pathResult.finalXCoordinate} ${pathResult.finalYCoordinate}`);
    }
  }
}