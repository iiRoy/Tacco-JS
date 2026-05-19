const parseProblemInput = (rawInputString) => {
  const lines = rawInputString.trim().split('\n');
  const firstLineValues = lines[0].split(' ').map(strVal => parseInt(strVal, 10));
  const secondLineValues = lines[1].split(' ').map(strVal => parseInt(strVal, 10));
  return {
    countN: firstLineValues[0],
    dataArray: secondLineValues
  };
};

const calculateResult = (problemData) => {
  const { countN, dataArray } = problemData;

  const intermediateValues = new Array(countN + 1);
  const initialProcessedValue = 1 - dataArray[0];
  intermediateValues[0] = initialProcessedValue;

  for (let currentIdx = 1; currentIdx < countN; currentIdx++) {
    const previousProcessedValue = intermediateValues[currentIdx - 1];
    const currentInputDataValue = dataArray[currentIdx];
    intermediateValues[currentIdx] = (previousProcessedValue * 2) - currentInputDataValue;
  }

  intermediateValues[countN] = 0;

  let finalAccumulator = dataArray[countN];

  for (let currentIdx = countN - 1; currentIdx >= 0; currentIdx--) {
    const nextProcessedValue = intermediateValues[currentIdx + 1];
    const nextInputDataValue = dataArray[currentIdx + 1];
    const comparisonThreshold = nextProcessedValue + nextInputDataValue;

    const currentProcessedValue = intermediateValues[currentIdx];

    if (currentProcessedValue > comparisonThreshold) {
      intermediateValues[currentIdx] = comparisonThreshold;
    } else {
      const doubledCurrentProcessedValue = currentProcessedValue * 2;
      if (doubledCurrentProcessedValue < comparisonThreshold) {
        return '-1';
      }
    }
    const currentSumComponent = intermediateValues[currentIdx] + dataArray[currentIdx];
    finalAccumulator += currentSumComponent;
  }

  return `${finalAccumulator}`;
};

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const parsedProblemData = parseProblemInput(rawInputContent);
const computedSolution = calculateResult(parsedProblemData);
console.log(computedSolution);
