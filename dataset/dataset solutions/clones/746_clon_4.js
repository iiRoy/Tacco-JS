const applyNumericTransformation = (valueInput) => (valueInput >= 10) ? (valueInput - 9) : valueInput;

const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split('\n');

const firstLineValue = parseInt(processedLines.shift(), 10);
const characterSequence = processedLines.shift().split('');
const thirdLineValue = parseInt(processedLines.shift(), 10);
const numericElements = processedLines.shift().split(' ').map(Number);

const { accumulatedBaseValue, factorList } = characterSequence.reduce((accumulator, charItem, charIndex) => {
  if (charItem === '*') {
    accumulator.factorList.push((charIndex % 2 === 0) ? 1 : 2);
  } else {
    const digitRepresentation = parseInt(charItem, 10);
    if (charIndex % 2 === 0) {
      accumulator.accumulatedBaseValue += digitRepresentation;
    } else {
      accumulator.accumulatedBaseValue += applyNumericTransformation(digitRepresentation * 2);
    }
  }
  return accumulator;
}, { accumulatedBaseValue: 0, factorList: [] });

const SUM_UPPER_BOUND = 1000000;

const transformationPathCounts = new Map();
transformationPathCounts.set(0, new Map([[accumulatedBaseValue, 1]]));

factorList.forEach((currentFactor, stageIndex) => {
  const previousStageMap = transformationPathCounts.get(stageIndex);
  if (!previousStageMap || previousStageMap.size === 0) {
    transformationPathCounts.set(stageIndex + 1, new Map());
    return;
  }

  const currentStageMap = new Map();
  transformationPathCounts.set(stageIndex + 1, currentStageMap);

  for (const [prevSum, countForPrevSum] of previousStageMap.entries()) {
    numericElements.forEach(dataItem => {
      const valueToAdd = applyNumericTransformation(dataItem * currentFactor);
      const nextSum = prevSum + valueToAdd;

      if (nextSum <= SUM_UPPER_BOUND) {
        currentStageMap.set(nextSum, (currentStageMap.get(nextSum) || 0) + countForPrevSum);
      }
    });
  }
});

const finalStageResultMap = transformationPathCounts.get(factorList.length);
let totalValidCombinations = 0;

if (finalStageResultMap) {
  const finalTargetMultiple = 10;
  const maxTargetSearchIndex = 100000;

  totalValidCombinations = Array.from({ length: maxTargetSearchIndex + 1 }, (_, index) => index)
    .reduce((accumulator, searchIndex) => {
      const targetSumCandidate = searchIndex * finalTargetMultiple;
      if (targetSumCandidate <= SUM_UPPER_BOUND) {
        return accumulator + (finalStageResultMap.get(targetSumCandidate) || 0);
      }
      return accumulator;
    }, 0);
}

console.log(totalValidCombinations);