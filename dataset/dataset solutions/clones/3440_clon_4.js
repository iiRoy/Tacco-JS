const fileSystemInterface = require("fs");

const obtainTextContent = () => fileSystemInterface.readFileSync("/dev/stdin", "utf8").trim();

const divideIntoSegments = (textualData) => textualData.split("\n");

const parseNumericItem = (textualItem) => parseInt(textualItem, 10);

const processNumericSequence = (textualSequence) => textualSequence.split(" ").map(Number);

const computeCentralTendency = (numericCollection) => {
  if (numericCollection.length === 0) {
    return NaN;
  }
  const aggregateSum = numericCollection.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
  return aggregateSum / numericCollection.length;
};

const locateOptimalElementIndex = (dataSeries, referencePoint) => {
  if (dataSeries.length === 0) {
    return 0;
  }
  const absoluteDifferences = dataSeries.map((individualValue) => Math.abs(individualValue - referencePoint));
  const minimumDifference = Math.min(...absoluteDifferences);
  return absoluteDifferences.indexOf(minimumDifference);
};

const orchestrateExecution = () => {
  const rawInputContent = obtainTextContent();
  const segmentedInput = divideIntoSegments(rawInputContent);

  const quantityOfElements = parseNumericItem(segmentedInput[0]);
  const valueDataSet = processNumericSequence(segmentedInput[1]);

  const calculatedMean = computeCentralTendency(valueDataSet);

  const resultingIndex = locateOptimalElementIndex(valueDataSet, calculatedMean);

  console.log(resultingIndex);
};

orchestrateExecution();