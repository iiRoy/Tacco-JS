'use strict';

function processInputData(rawData) {
  const trimmedInputString = rawData.trim();
  const characterArray = trimmedInputString.split('');
  const digitSequence = characterArray.map(charValue => Number(charValue));

  let sumOddPositions = 0;
  let sumEvenPositions = 0;
  const sequenceLength = digitSequence.length;

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const currentDigitValue = digitSequence[currentIndex];
    if (currentIndex % 2 === 0) {
      sumEvenPositions += currentDigitValue;
    } else {
      sumOddPositions += currentDigitValue;
    }
  }

  const countEvenIndexedPositions = Math.ceil(sequenceLength / 2);
  const countOddIndexedPositions = Math.floor(sequenceLength / 2);

  const changesForEvenTarget = countEvenIndexedPositions - sumEvenPositions;
  const changesForOddTarget = countOddIndexedPositions - sumOddPositions;

  const totalCostScenarioA = changesForEvenTarget + sumOddPositions;
  const totalCostScenarioB = sumEvenPositions + changesForOddTarget;

  const finalMinimumCost = Math.min(totalCostScenarioA, totalCostScenarioB);

  console.log(finalMinimumCost);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
