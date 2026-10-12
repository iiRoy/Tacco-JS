function processData(rawData) {
  const limitCount = rawData[0][1];
  const sortedNumbers = rawData[1].sort((elemA, elemB) => elemB - elemA);

  const combinationValues = sortedNumbers.map((num) => [num * 2]);

  let totalSum = 0;
  let loopIndex;
  let pendingAddition = null;

  const retrieveCurrentMaxEntry = (combinations) => {
    const outerIndex = 0;
    const innerIndex = combinations[outerIndex].length - 1;
    const value = combinations[outerIndex][innerIndex];
    return { value, outerIndex, innerIndex };
  };

  const computeNextCombinationValue = (baseNumbers, currentOuterIdx, currentInnerIdx) => {
    const nextElementIndex = currentInnerIdx + 1;
    const nextNumber = baseNumbers[nextElementIndex];
    if (nextNumber !== undefined) {
      return baseNumbers[currentOuterIdx] + nextNumber;
    }
    return 0;
  };

  for (loopIndex = 0; loopIndex < limitCount; loopIndex++) {
    if (pendingAddition !== null) {
      totalSum += pendingAddition;
      pendingAddition = null;
      continue;
    }

    const { value: currentMaxValue, outerIndex: maxOuterIndex, innerIndex: maxInnerIndex } = retrieveCurrentMaxEntry(combinationValues);

    totalSum += currentMaxValue;

    if (maxInnerIndex > 0) {
      pendingAddition = currentMaxValue;
    }

    const newCombinationVal = computeNextCombinationValue(sortedNumbers, maxOuterIndex, maxInnerIndex);
    combinationValues[maxOuterIndex].push(newCombinationVal);
  }

  console.log(totalSum);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number))
);
