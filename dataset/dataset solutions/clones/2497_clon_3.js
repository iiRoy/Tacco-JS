'use strict';

function processInput(rawData) {
  const trimmedInput = rawData.trim();
  const inputLines = trimmedInput.split('\n');

  const numberOfElements = Number(inputLines.shift());

  const numberStrings = inputLines[0].split(' ');
  const numericValues = numberStrings.map(currentString => Number(currentString));
  const sortedSidesArray = numericValues.sort((valA, valB) => valA - valB);

  const checkTriangleValidity = (sideA, sideB, sideC) => {
    const firstCondition = sideA + sideB > sideC;
    const secondCondition = sideA + sideC > sideB;
    const thirdCondition = sideB + sideC > sideA;
    return firstCondition && secondCondition && thirdCondition;
  };

  let validTriangleCount = 0;

  for (let indexA = 0; indexA < numberOfElements; indexA++) {
    const currentSideA = sortedSidesArray[indexA];
    for (let indexB = indexA + 1; indexB < numberOfElements; indexB++) {
      const currentSideB = sortedSidesArray[indexB];
      for (let indexC = indexB + 1; indexC < numberOfElements; indexC++) {
        const currentSideC = sortedSidesArray[indexC];

        if (currentSideA + currentSideB < currentSideC) {
          break;
        }

        if (checkTriangleValidity(currentSideA, currentSideB, currentSideC)) {
          validTriangleCount++;
        }
      }
    }
  }

  console.log(validTriangleCount);
}

const standardInputFilePath = '/dev/stdin';
const fileSystemModule = require('fs');
const inputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

processInput(inputContent);
