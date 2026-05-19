'use strict';

const parseNumberLine = (lineContent) => {
  return lineContent.split(' ').map(Number);
};

const computeGreatestCommonDivisor = (valueA, valueB) => {
  if (valueB === 0) {
    return valueA;
  }
  return computeGreatestCommonDivisor(valueB, valueA % valueB);
};

function processInputData(rawInputString) {
  const trimmedInput = rawInputString.trim();
  const inputLines = trimmedInput.split('\n');

  const parsedNumericLines = inputLines.map(parseNumberLine);

  const numMonsters = parsedNumericLines[0][0];
  const sortedMonsterStrengths = parsedNumericLines[1].sort((a, b) => a - b);

  const initialMinimumGCD = Number.MAX_SAFE_INTEGER;
  let minimumCommonDivisor = initialMinimumGCD;

  const iterationLimit = numMonsters - 1;

  for (let currentIdx = 0; currentIdx < iterationLimit; currentIdx++) {
    const firstMonsterStrength = sortedMonsterStrengths[currentIdx];
    const secondMonsterStrength = sortedMonsterStrengths[currentIdx + 1];
    const currentPairGCD = computeGreatestCommonDivisor(firstMonsterStrength, secondMonsterStrength);
    minimumCommonDivisor = Math.min(currentPairGCD, minimumCommonDivisor);
  }

  console.log(minimumCommonDivisor);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
