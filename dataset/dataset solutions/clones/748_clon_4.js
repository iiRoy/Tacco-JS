const transformValue = (inputNumber) => inputNumber - (inputNumber > 9 ? 9 : 0);

const rawDataString = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawDataString.trim().split('\n');

const [
  _lineOne,
  characterSequenceRaw,
  _lineThree,
  numericFactorSequenceRaw
] = dataLines;

const characterSequence = characterSequenceRaw.split('');
const numericFactorSequence = numericFactorSequenceRaw.split(' ').map(Number);

const { baseSumComponent, multiplierFactors } = characterSequence.reduce(
  (accumulatorObject, currentCharacter, characterIndex) => {
    if (currentCharacter === '*') {
      accumulatorObject.multiplierFactors.push(characterIndex % 2 === 0 ? 1 : 2);
    } else {
      const digitNumerical = parseInt(currentCharacter, 10);
      if (characterIndex % 2 === 0) {
        accumulatorObject.baseSumComponent += digitNumerical;
      } else {
        accumulatorObject.baseSumComponent += transformValue(digitNumerical * 2);
      }
    }
    return accumulatorObject;
  },
  { baseSumComponent: 0, multiplierFactors: [] }
);

const MAXIMUM_POSSIBLE_SUM = 100;

let pathCountsTable = [Array.from({ length: MAXIMUM_POSSIBLE_SUM }, () => 0)];
pathCountsTable[0][0] = 1;

const finalRowOfPaths = multiplierFactors.reduce((currentIntermediateRow, currentMultiplierValue) => {
  const nextIntermediateRow = Array.from({ length: MAXIMUM_POSSIBLE_SUM }, () => 0);

  numericFactorSequence.forEach((currentNumericFactor) => {
    const valueToAddAfterTransformation = transformValue(currentNumericFactor * currentMultiplierValue);

    currentIntermediateRow.forEach((countFromPreviousState, currentSumValue) => {
      if (countFromPreviousState === 0) return;

      const newAccumulatedSum = currentSumValue + valueToAddAfterTransformation;
      if (newAccumulatedSum < MAXIMUM_POSSIBLE_SUM) {
        nextIntermediateRow[newAccumulatedSum] += countFromPreviousState;
      }
    });
  });
  return nextIntermediateRow;
}, pathCountsTable[0]);

const finalAccumulatedCount = finalRowOfPaths.reduce((totalCount, countAtThisSum, sumIndex) => {
  if ((baseSumComponent + sumIndex) % 10 === 0) {
    return totalCount + countAtThisSum;
  }
  return totalCount;
}, 0);

console.log(finalAccumulatedCount);