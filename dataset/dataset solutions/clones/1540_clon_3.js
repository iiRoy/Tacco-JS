const parseCoordinatePair = (coordinateString) => {
  if (!coordinateString || typeof coordinateString !== 'string' || coordinateString.trim() === '') {
    return [NaN, NaN];
  }
  const parts = coordinateString.split(" ");
  if (parts.length !== 2) {
    return [NaN, NaN];
  }
  const xVal = Number(parts[0]);
  const yVal = Number(parts[1]);

  if (isNaN(xVal) || isNaN(yVal)) {
    return [NaN, NaN];
  }
  return [xVal, yVal];
};

const calculateManhattanDistance = (coord1, coord2) => {
  const deltaX = Math.abs(coord1[0] - coord2[0]);
  const deltaY = Math.abs(coord1[1] - coord2[1]);
  return deltaX + deltaY;
};

const processGeometricData = (rawDataInput) => {
  const parsedLines = rawDataInput.split("\n").filter(line => line.trim() !== '');

  let expectedPointCount = Number(parsedLines[0]);

  if (isNaN(expectedPointCount) || expectedPointCount <= 0) {
    console.log(0);
    return;
  }

  const uniqueCoordinatesSet = new Set();
  const actualCoordinateList = [];

  for (let currentLineIndex = 1; currentLineIndex <= expectedPointCount; ++currentLineIndex) {
    const currentLine = parsedLines[currentLineIndex];
    if (!currentLine) continue;

    const currentCoordinatePair = parseCoordinatePair(currentLine);

    if (isNaN(currentCoordinatePair[0]) || isNaN(currentCoordinatePair[1])) {
      continue;
    }

    const coordinateKey = JSON.stringify(currentCoordinatePair);
    if (!uniqueCoordinatesSet.has(coordinateKey)) {
      uniqueCoordinatesSet.add(coordinateKey);
      actualCoordinateList.push(currentCoordinatePair);
    }
  }

  if (actualCoordinateList.length < 2) {
    console.log(0);
    return;
  }

  const allXCoordinates = actualCoordinateList.map(coord => coord[0]);
  const allYCoordinates = actualCoordinateList.map(coord => coord[1]);

  const minXValue = Math.min(...allXCoordinates);
  const maxXValue = Math.max(...allXCoordinates);
  const minYValue = Math.min(...allYCoordinates);
  const maxYValue = Math.max(...allYCoordinates);

  const boundaryPointIndices = new Set();
  for (let coordIdx = 0; coordIdx < actualCoordinateList.length; ++coordIdx) {
    const [xCoord, yCoord] = actualCoordinateList[coordIdx];
    if (xCoord === minXValue || xCoord === maxXValue || yCoord === minYValue || yCoord === maxYValue) {
      boundaryPointIndices.add(coordIdx);
    }
  }

  const filteredPointIndices = Array.from(boundaryPointIndices);

  if (filteredPointIndices.length < 2) {
    console.log(0);
    return;
  }

  const calculatedDistances = [];
  for (let i = 0; i < filteredPointIndices.length; ++i) {
    for (let j = i + 1; j < filteredPointIndices.length; ++j) {
      const point1 = actualCoordinateList[filteredPointIndices[i]];
      const point2 = actualCoordinateList[filteredPointIndices[j]];
      calculatedDistances.push(calculateManhattanDistance(point1, point2));
    }
  }

  calculatedDistances.sort((valA, valB) => valB - valA);

  console.log(calculatedDistances[0]);
};

processGeometricData(require('fs').readFileSync('/dev/stdin', 'utf8'));