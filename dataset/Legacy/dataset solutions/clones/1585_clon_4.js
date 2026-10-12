const matrixFlip = (sourceMatrix) => {
  if (!sourceMatrix || sourceMatrix.length === 0 || sourceMatrix[0] === undefined) {
    return [];
  }

  const rowCount = sourceMatrix.length;
  const colCount = sourceMatrix[0].length;
  const flippedMatrix = [];

  for (let cIdx = 0; cIdx < colCount; cIdx++) {
    const newRow = [];
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
      newRow.push(sourceMatrix[rIdx][cIdx]);
    }
    flippedMatrix.push(newRow);
  }
  return flippedMatrix;
};

Array.prototype.mostFrequent = function () {
  if (this.length === 0) {
    throw new Error("error");
  }

  const occurrenceRegistry = this.reduce((accumulator, currentItem) => {
    const itemIdentifier = String(currentItem) + "_" + typeof currentItem;
    const existingEntry = accumulator.get(itemIdentifier) || { tally: 0, originalDatum: currentItem };
    existingEntry.tally++;
    accumulator.set(itemIdentifier, existingEntry);
    return accumulator;
  }, new Map());

  let highestTally = 0;
  let mostCommonDatum = null;

  for (const [identifier, dataEntry] of occurrenceRegistry.entries()) {
    if (dataEntry.tally > highestTally) {
      highestTally = dataEntry.tally;
      mostCommonDatum = dataEntry.originalDatum;
    }
  }
  return mostCommonDatum;
};

const countSpecificOccurrences = (collection, targetValue) => {
  return collection.reduce((total, element) => total + (element === targetValue ? 1 : 0), 0);
};

function ProcessInput(rawInput) {
  const [firstLineContent, ...coordinateLines] = rawInput.split('\n');
  const [rows, columns, numPoints] = firstLineContent.split(' ').map(Number);
  const pointCoordinates = coordinateLines.map(str => str.split(' ').map(Number));

  const transformedCoordinates = matrixFlip(pointCoordinates);
  const dominantX = transformedCoordinates[0].mostFrequent();
  const dominantY = transformedCoordinates[1].mostFrequent();

  const dominantXOccurrences = countSpecificOccurrences(transformedCoordinates[0], dominantX);
  const dominantYOccurrences = countSpecificOccurrences(transformedCoordinates[1], dominantY);

  const finalOutcome = (numPoints === 1)
    ? 1
    : (dominantXOccurrences === 1 || dominantYOccurrences === 1)
      ? (dominantXOccurrences + dominantYOccurrences)
      : (dominantXOccurrences + dominantYOccurrences - 1);

  console.log(finalOutcome);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
