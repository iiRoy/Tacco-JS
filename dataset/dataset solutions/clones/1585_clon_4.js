function rotateMatrix(sourceGrid) {
  if (!sourceGrid || sourceGrid.length === 0 || sourceGrid[0].length === 0) {
    return [];
  }
  const rowDimension = sourceGrid.length;
  const columnDimension = sourceGrid[0].length;
  const transformedGrid = [];
  for (let col = 0; col < columnDimension; col++) {
    const newRow = [];
    for (let row = 0; row < rowDimension; row++) {
      newRow.push(sourceGrid[row][col]);
    }
    transformedGrid.push(newRow);
  }
  return transformedGrid;
}

function determineDominantItem(dataSequence) {
  if (dataSequence.length === 0) {
    throw new Error("Collection is empty for dominant item analysis.");
  }

  const occurrenceTally = dataSequence.reduce((accumulator, element) => {
    accumulator.set(element, (accumulator.get(element) || 0) + 1);
    return accumulator;
  }, new Map());

  let highestFrequency = 0;
  let dominantElement = null;

  for (const [element, frequency] of occurrenceTally.entries()) {
    if (frequency > highestFrequency) {
      highestFrequency = frequency;
      dominantElement = element;
    }
  }
  return dominantElement;
}

function countSpecificItem(collection, targetValue) {
  return collection.reduce((currentCount, item) => (item === targetValue ? currentCount + 1 : currentCount), 0);
}

function analyzeInputString(rawTextContent) {
  const textLines = rawTextContent.split('\n');
  const [headerInfo, ...datasetLines] = textLines;
  const [valA, valB, valC] = headerInfo.split(' ').map(Number);
  const processedDataset = datasetLines.map(line => line.split(' ').map(Number));
  return {
    dimA: valA,
    dimB: valB,
    specialCount: valC,
    dataEntries: processedDataset
  };
}

function computeProgramResult(parsedInputData) {
  const transformedEntries = rotateMatrix(parsedInputData.dataEntries);
  const firstComponent = transformedEntries[0];
  const secondComponent = transformedEntries[1];

  const primaryDominant = determineDominantItem(firstComponent);
  const secondaryDominant = determineDominantItem(secondComponent);

  const primaryDominantTally = countSpecificItem(firstComponent, primaryDominant);
  const secondaryDominantTally = countSpecificItem(secondComponent, secondaryDominant);

  if (parsedInputData.specialCount === 1) {
    return 1;
  } else if (primaryDominantTally === 1 || secondaryDominantTally === 1) {
    return primaryDominantTally + secondaryDominantTally;
  } else {
    return primaryDominantTally + secondaryDominantTally - 1;
  }
}

function runApplication(dataSourceReader) {
  try {
    const rawContent = dataSourceReader();
    const inputAttributes = analyzeInputString(rawContent);
    const finalCalculatedValue = computeProgramResult(inputAttributes);
    return finalCalculatedValue;
  } catch (err) {
    throw err;
  }
}

const obtainInputFromFile = () => require("fs").readFileSync("/dev/stdin", "utf8");

console.log(runApplication(obtainInputFromFile));