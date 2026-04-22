const convertToNumber = (strRepresentation) => {
  let numericValue = 0;
  let isValueNegative = false;
  let charPosition = 0;

  if (strRepresentation.charCodeAt(0) === 45) { // ASCII for '-'
    isValueNegative = true;
    charPosition = 1;
  }

  while (charPosition < strRepresentation.length) {
    numericValue = numericValue * 10 + (strRepresentation.charCodeAt(charPosition) - 48); // ASCII for '0' is 48
    charPosition++;
  }

  return isValueNegative ? -numericValue : numericValue;
};

const buildRepeatedSequence = (characterUnit, repetitionCount) => {
  let resultingString = '';
  let currentRepetition = 0;
  while (currentRepetition < repetitionCount) {
    resultingString += characterUnit;
    currentRepetition++;
  }
  return resultingString;
};

const processCoordinateData = (rawDataInput) => {
  const inputLines = rawDataInput.split('\n');
  const countOfPoints = convertToNumber(inputLines[0]);

  const pointCollection = [];
  let initialPointSumParity = 0;

  let pointIndex = 0;
  while (pointIndex < countOfPoints) {
    const coordinateStrings = inputLines[pointIndex + 1].split(' ');
    const currentXCoord = convertToNumber(coordinateStrings[0]);
    const currentYCoord = convertToNumber(coordinateStrings[1]);

    pointCollection.push({ xComponent: currentXCoord, yComponent: currentYCoord });

    if (pointIndex === 0) {
      initialPointSumParity = (currentXCoord + currentYCoord) & 1; // Check parity using bitwise AND
    } else {
      const currentPointSumParity = (currentXCoord + currentYCoord) & 1;
      if (currentPointSumParity !== initialPointSumParity) {
        console.log(-1);
        return;
      }
    }
    pointIndex++;
  }

  if (initialPointSumParity === 1) {
    let adjustIndex = 0;
    while (adjustIndex < countOfPoints) {
      let targetPoint = pointCollection[adjustIndex];
      if ((targetPoint.xComponent & 1) === 1) { // If xComponent is odd
        let swapTemp = targetPoint.xComponent;
        targetPoint.xComponent = targetPoint.yComponent;
        targetPoint.yComponent = swapTemp;
      }
      adjustIndex++;
    }
  }

  const basePathLength = 20;
  let parityContributionToLength = (pointCollection[0].xComponent & 1) + (pointCollection[0].yComponent & 1);
  const totalPathLength = basePathLength + parityContributionToLength;

  const pathComponentMagnitudes = Array.from({ length: totalPathLength }, () => '1').join(' ');
  console.log(totalPathLength);
  console.log(pathComponentMagnitudes);

  let outputGenerationIndex = 0;
  while (outputGenerationIndex < countOfPoints) {
    let currentPointBeingProcessed = pointCollection[outputGenerationIndex];
    let currentPath = '';
    let adjustedX = currentPointBeingProcessed.xComponent;
    let adjustedY = currentPointBeingProcessed.yComponent;

    if ((adjustedX & 1) === 1) {
      currentPath += 'R';
      adjustedX++;
    }
    if ((adjustedY & 1) === 1) {
      currentPath += 'R';
      adjustedY++;
    }

    const decompositionMagnitude = 10; // Constant used in path calculation

    currentPath += buildRepeatedSequence('R', (decompositionMagnitude + adjustedX) / 2);
    currentPath += buildRepeatedSequence('L', (decompositionMagnitude - adjustedX) / 2);
    currentPath += buildRepeatedSequence('U', (decompositionMagnitude + adjustedY) / 2);
    currentPath += buildRepeatedSequence('D', (decompositionMagnitude - adjustedY) / 2);
    
    console.log(currentPath);
    outputGenerationIndex++;
  }
};

processCoordinateData(require("fs").readFileSync("/dev/stdin", "utf8"));