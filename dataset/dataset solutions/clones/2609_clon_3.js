class InputDataProcessor {
  constructor(sourceContent) {
    this.sourceLines = sourceContent.trim().split("\n");
    this.currentLineIndex = 0;
  }

  _prepareLineForValueExtraction(lineIndex) {
    if (typeof this.sourceLines[lineIndex] === "string") {
      this.sourceLines[lineIndex] = this.sourceLines[lineIndex].split(" ").reverse();
    }
  }

  readSingleValue(returnAsString = false) {
    this._prepareLineForValueExtraction(this.currentLineIndex);
    const lineParts = this.sourceLines[this.currentLineIndex];
    const extractedValue = lineParts.pop();

    if (lineParts.length === 0) {
      this.currentLineIndex++;
    }
    return returnAsString ? extractedValue : Number(extractedValue);
  }

  readAllLineValues(returnAsString = false) {
    const lineContent = this.sourceLines[this.currentLineIndex++].split(" ");
    return returnAsString ? lineContent : lineContent.map(val => Number(val));
  }

  readMultipleLinesAsMatrix(numberOfRows, returnAsString = false) {
    const startIdx = this.currentLineIndex;
    this.currentLineIndex += numberOfRows;
    const matrixRows = this.sourceLines.slice(startIdx, this.currentLineIndex).map(line => line.split(" "));
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(val => Number(val)));
  }

  readRawLines(numberOfLines, returnAsString = false) {
    const startIdx = this.currentLineIndex;
    this.currentLineIndex += numberOfLines;
    const rawLines = this.sourceLines.slice(startIdx, this.currentLineIndex);
    return returnAsString ? rawLines : rawLines.map(line => Number(line));
  }
}

const inputReader = new InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

let pointCount;
let pointsData = [];

const calculateNormalizedAngle = (xCoord, yCoord) => {
  if (xCoord === 0) {
    return yCoord > 0 ? 90 : 270;
  }
  if (yCoord === 0) {
    return xCoord > 0 ? 0 : 180;
  }

  let angleDegrees = Math.atan(yCoord / xCoord) * 180 / Math.PI;

  if (xCoord < 0) {
    angleDegrees += 180;
  }
  if (angleDegrees < 0) {
    angleDegrees += 360;
  }
  return Math.round(angleDegrees * 1e7) / 1e7;
};

const collectAndFilterPoints = (reader, initialCount) => {
  const collectedPoints = [];
  for (let idx = 0; idx < initialCount; idx++) {
    const currentX = reader.readSingleValue();
    const currentY = reader.readSingleValue();
    if (currentX === 0 && currentY === 0) {
      continue;
    }
    collectedPoints.push([currentX, currentY, calculateNormalizedAngle(currentX, currentY)]);
  }
  return collectedPoints;
};

console.log(calculateMaxVectorMagnitude());

function calculateMaxVectorMagnitude() {
  const initialPointCount = inputReader.readSingleValue();
  pointsData = collectAndFilterPoints(inputReader, initialPointCount);

  pointCount = pointsData.length;
  pointsData.sort((p1, p2) => p1[2] - p2[2]);

  const extendedPointsData = [...pointsData, ...pointsData];

  let maxSquaredMagnitude = 0;
  let currentSumX = 0;
  let currentSumY = 0;
  let windowEndIndex = 0;

  for (let windowStartIndex = 0; windowStartIndex < pointCount; windowStartIndex++) {
    while (windowEndIndex < windowStartIndex + pointCount) {
      const nextVectorX = extendedPointsData[windowEndIndex][0];
      const nextVectorY = extendedPointsData[windowEndIndex][1];

      const potentialSumX = currentSumX + nextVectorX;
      const potentialSumY = currentSumY + nextVectorY;

      const currentMagnitudeSquared = currentSumX * currentSumX + currentSumY * currentSumY;
      const potentialMagnitudeSquared = potentialSumX * potentialSumX + potentialSumY * potentialSumY;

      if (currentMagnitudeSquared >= potentialMagnitudeSquared) {
        break;
      }

      currentSumX = potentialSumX;
      currentSumY = potentialSumY;
      windowEndIndex++;
    }

    const finalWindowMagnitudeSquared = currentSumX * currentSumX + currentSumY * currentSumY;
    if (finalWindowMagnitudeSquared > maxSquaredMagnitude) {
      maxSquaredMagnitude = finalWindowMagnitudeSquared;
    }

    const vectorToRemoveX = extendedPointsData[windowStartIndex][0];
    const vectorToRemoveY = extendedPointsData[windowStartIndex][1];
    currentSumX -= vectorToRemoveX;
    currentSumY -= vectorToRemoveY;
  }

  return Math.sqrt(maxSquaredMagnitude);
}
