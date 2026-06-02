'use strict';

const addMod = (valueA, valueB, modulus) => {
  return (valueA + valueB) % modulus;
};

const parseInputData = (rawInputString) => {
  const processedLines = rawInputString.trim().split('\n');

  const numMenWomen = parseInt(processedLines.shift(), 10);
  const compatibilityGrid = processedLines.map(lineContent =>
    lineContent.split(/\s+/).map(val => parseInt(val, 10))
  );

  return { numMenWomen, compatibilityGrid };
};

function solveMatchingProblem(rawInputString) {
  const { numMenWomen, compatibilityGrid } = parseInputData(rawInputString);

  const allWomenMatchedMask = Math.pow(2, numMenWomen);
  const moduloConstant = Math.pow(10, 9) + 7;

  const matchingCounts = Array.from({ length: numMenWomen }, () => ({}));

  const bitMasks = Array.from({ length: numMenWomen }, (_, index) => (1 << index));

  const initialBaseCase = { 0: 1 };

  for (let currentManIdx = 0; currentManIdx < numMenWomen; ++currentManIdx) {
    const previousManStates = (currentManIdx === 0) ? initialBaseCase : matchingCounts[currentManIdx - 1];
    const currentManCompatibilityRow = compatibilityGrid[currentManIdx];

    for (const maskKey in previousManStates) {
      if (!Object.prototype.hasOwnProperty.call(previousManStates, maskKey)) {
        continue;
      }
      const currentWomanMask = parseInt(maskKey, 10);
      const waysToReachCurrentMask = previousManStates[maskKey];

      const waysModulated = waysToReachCurrentMask % moduloConstant;

      for (let potentialWomanIdx = 0; potentialWomanIdx < numMenWomen; ++potentialWomanIdx) {
        const womanBit = bitMasks[potentialWomanIdx];

        if ((currentWomanMask & womanBit) > 0) {
          continue;
        }

        if (currentManCompatibilityRow[potentialWomanIdx] === 0) {
          continue;
        }

        const nextWomanMask = currentWomanMask | womanBit;

        const existingWaysForNextMask = matchingCounts[currentManIdx][nextWomanMask] || 0;
        matchingCounts[currentManIdx][nextWomanMask] = addMod(existingWaysForNextMask, waysModulated, moduloConstant);
      }
    }
  }

  const finalResult = matchingCounts[numMenWomen - 1][allWomenMatchedMask - 1] || 0;
  console.log(finalResult % moduloConstant);
}

solveMatchingProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
