'use strict';

const evaluateSequence = (dataString) => {
  const parsedNumbers = dataString.trim().split(' ').map(val => +val);
  const initialX = parsedNumbers[0];
  const initialY = parsedNumbers[1];
  const initialZ = parsedNumbers[2];

  if (initialX === initialY && initialY === initialZ && initialX % 2 === 0) {
    console.log(-1);
    return -1;
  }

  const determineEvolutionSteps = (currentX, currentY, currentZ, iterationDepth) => {
    if (currentX % 2 !== 0 || currentY % 2 !== 0 || currentZ % 2 !== 0) {
      return iterationDepth;
    }

    const valueA = currentX;
    const valueB = currentY;
    const valueC = currentZ;

    const nextA = (valueB + valueC) / 2;
    const nextB = (valueA + valueC) / 2;
    const nextC = (valueA + valueB) / 2;

    return determineEvolutionSteps(nextA, nextB, nextC, iterationDepth + 1);
  };

  const finalCount = determineEvolutionSteps(initialX, initialY, initialZ, 0);

  console.log(finalCount);
  return finalCount;
};

evaluateSequence(require('node:fs').readFileSync('/dev/stdin', 'utf8'));