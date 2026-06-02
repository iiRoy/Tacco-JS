"use strict";

const parseNumericLine = (inputLine) => inputLine.split(' ').map(parseFloat);

const calculateSquaredDistance = (vectorOne, vectorTwo) =>
  vectorOne.reduce((accumulatedSum, currentComponent, componentIndex) =>
    accumulatedSum + (currentComponent - vectorTwo[componentIndex]) ** 2, 0);

const isWholeNumber = (valueToCheck) => valueToCheck % 1 === 0;

function executeSolution(rawInputContent) {
  const allInputLines = rawInputContent.trim().split('\n');

  const [vectorCount, dimensionCount] = parseNumericLine(allInputLines[0]);

  const coordinateVectors = allInputLines.slice(1).map(parseNumericLine);

  const vectorIndexSequence = Array.from({ length: vectorCount }, (_, index) => index);

  const pairCombinations = vectorIndexSequence.flatMap((firstIndex) =>
    vectorIndexSequence
      .filter((secondIndex) => firstIndex < secondIndex)
      .map((secondIndex) => [firstIndex, secondIndex])
  );

  const integerDistanceCounter = pairCombinations.reduce((currentTally, [idxA, idxB]) => {
    const vecA = coordinateVectors[idxA];
    const vecB = coordinateVectors[idxB];

    const squaredMagnitude = calculateSquaredDistance(vecA, vecB);
    const euclideanMagnitude = Math.sqrt(squaredMagnitude);

    return isWholeNumber(euclideanMagnitude) ? currentTally + 1 : currentTally;
  }, 0);

  console.log(integerDistanceCounter);
}

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
