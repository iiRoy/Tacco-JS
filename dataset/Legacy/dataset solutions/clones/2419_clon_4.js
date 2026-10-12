"use strict";

const getOppositeColor = (colorIdentifier) => (colorIdentifier === "R" ? "B" : "R");

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readLineAsync = () => {
  return new Promise((resolve) => {
    inputReader.once("line", resolve);
  });
};

const determinePivotValue = async (currentLowerBound, currentUpperBound, initialResponseCharacter, elementCount) => {
  if (currentUpperBound - currentLowerBound <= 1) {
    return currentUpperBound;
  }

  const midPoint = Math.floor((currentUpperBound + currentLowerBound + 1) / 2);

  const currentQueryElements = Array.from({ length: elementCount }, (_, index) => midPoint + index);

  console.log("?", currentQueryElements.join(" "));
  const queryResponse = await readLineAsync();

  if (initialResponseCharacter !== queryResponse[0]) {
    return determinePivotValue(currentLowerBound, midPoint, initialResponseCharacter, elementCount);
  } else {
    return determinePivotValue(midPoint, currentUpperBound, initialResponseCharacter, elementCount);
  }
};

const executeSolver = async () => {
  let finalColors = [];

  const elementCount = parseInt(await readLineAsync(), 10);
  const totalPossibleElements = 2 * elementCount;

  const initialQuerySequence = Array.from({ length: elementCount }, (_, index) => index + 1);
  console.log("?", initialQuerySequence.join(" "));
  const firstResponse = await readLineAsync();

  const pivotValue = await determinePivotValue(1, elementCount + 1, firstResponse[0], elementCount);

  finalColors[pivotValue - 2] = firstResponse[0];
  finalColors[pivotValue - 2 + elementCount] = getOppositeColor(firstResponse[0]);

  const partialQueryA = Array.from({ length: elementCount - 1 }, (_, index) => {
    const value = pivotValue + index;
    return value % totalPossibleElements;
  });

  const partialQueryB = Array.from({ length: elementCount - 1 }, (_, index) => {
    const pValue = (pivotValue + index) % totalPossibleElements;
    return (pValue + elementCount - 1) % totalPossibleElements + 1;
  });

  const referenceSet = new Set(partialQueryA);

  const allIndices = Array.from({ length: totalPossibleElements }, (_, index) => index + 1);

  const indicesToQuery = allIndices.filter((elementIndex) => {
    return finalColors[elementIndex - 1] === undefined;
  });

  for (const currentElementIndex of indicesToQuery) {
    let constructedQueryArray;
    if (referenceSet.has(currentElementIndex)) {
      constructedQueryArray = [...partialQueryB, currentElementIndex];
    } else {
      constructedQueryArray = [...partialQueryA, currentElementIndex];
    }

    console.log("?", constructedQueryArray.join(" "));
    const responseForElement = await readLineAsync();
    finalColors[currentElementIndex - 1] = responseForElement[0];
  }

  console.log("!", finalColors.join(""));

  inputReader.close();
};

executeSolver();
