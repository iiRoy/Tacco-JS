let inputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataSegment) => {
  inputBuffer += dataSegment;
});

process.stdin.on('end', () => {
  const allInputLines = inputBuffer.split('\n');
  const scenarioResults = [];
  let lineCursor = 0;

  const adjacencies = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  const createMatrix = (widthSize, heightSize) => {
    return Array.from({ length: widthSize }, () => Array.from({ length: heightSize }, () => 0));
  };

  const placeFeature = (targetMatrix, featureColor, featureShape, colPos, rowPos) => {
    const shapeDimensions = [[4, 2], [2, 4]][featureShape];
    const featureWidth = shapeDimensions[0];
    const featureHeight = shapeDimensions[1];

    Array.from({ length: featureWidth }).forEach((_, rOffset) => {
      Array.from({ length: featureHeight }).forEach((_, cOffset) => {
        const currentX = colPos - 1 + rOffset;
        const currentY = rowPos - 1 + cOffset;
        if (currentX >= 0 && currentX < targetMatrix.length &&
            currentY >= 0 && currentY < targetMatrix[0].length) {
          targetMatrix[currentX][currentY] = featureColor;
        }
      });
    });
  };

  const explorePathRecursive = (xCoord, yCoord, visitedLocations, currentMatrix, requiredColor, targetX, targetY) => {
    if (xCoord < 0 || xCoord >= currentMatrix.length || yCoord < 0 || yCoord >= currentMatrix[0].length) {
      return false;
    }
    if (currentMatrix[xCoord][yCoord] !== requiredColor) {
      return false;
    }
    const locationKey = `${xCoord},${yCoord}`;
    if (visitedLocations.has(locationKey)) {
      return false;
    }

    visitedLocations.add(locationKey);

    if (xCoord === targetX && yCoord === targetY) {
      return true;
    }

    for (const [dx, dy] of adjacencies) {
      if (explorePathRecursive(xCoord + dx, yCoord + dy, visitedLocations, currentMatrix, requiredColor, targetX, targetY)) {
        return true;
      }
    }

    return false;
  };

  const evaluateConnectivity = (currentMatrix, entryCoordinates, exitCoordinates) => {
    const entryX = entryCoordinates[0] - 1;
    const entryY = entryCoordinates[1] - 1;
    const exitX = exitCoordinates[0] - 1;
    const exitY = exitCoordinates[1] - 1;

    if (currentMatrix[entryX][entryY] === 0) {
      return false;
    }

    const startingColor = currentMatrix[entryX][entryY];
    const visitedSet = new Set();

    return explorePathRecursive(entryX, entryY, visitedSet, currentMatrix, startingColor, exitX, exitY);
  };

  const processNextDataset = () => {
    const sizeData = allInputLines[lineCursor++].split(' ').map(Number);
    if (sizeData[0] === 0 && sizeData[1] === 0) {
      return;
    }

    const matrixForDataset = createMatrix(sizeData[0], sizeData[1]);

    const entryPointData = allInputLines[lineCursor++].split(' ').map(Number);
    const exitPointData = allInputLines[lineCursor++].split(' ').map(Number);
    const numberOfFeatures = Number(allInputLines[lineCursor++]);

    Array.from({ length: numberOfFeatures }).forEach(() => {
      const featureConfiguration = allInputLines[lineCursor++].split(' ').map(Number);
      placeFeature(matrixForDataset, featureConfiguration[0], featureConfiguration[1], featureConfiguration[2], featureConfiguration[3]);
    });

    scenarioResults.push(evaluateConnectivity(matrixForDataset, entryPointData, exitPointData) ? 'OK' : 'NG');

    processNextDataset();
  };

  processNextDataset();
  console.log(scenarioResults.join('\n'));
});