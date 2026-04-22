const processInput = (inputSource) => {
  const dataLines = inputSource.split('\n');
  const [controlData, numericSequence] = dataLines;

  const [arrayLength, modulusValue] = controlData.split(' ').map(Number);
  const sequenceElements = numericSequence.split(' ').map(Number);

  let currentCumulativeRemainder = 0;
  const remainderFrequencies = sequenceElements.reduce((accumulatorMap, currentElement) => {
    currentCumulativeRemainder = (currentCumulativeRemainder + currentElement) % modulusValue;
    accumulatorMap.set(currentCumulativeRemainder, (accumulatorMap.get(currentCumulativeRemainder) || 0) + 1);
    return accumulatorMap;
  }, new Map([[0, 1]])); // Initialize with the remainder of the empty prefix sum (0)

  const totalSatisfyingSubarrays = Array.from(remainderFrequencies.values()).reduce((finalCount, frequency) => {
    return finalCount + (frequency * (frequency - 1) / 2);
  }, 0);

  console.log(totalSatisfyingSubarrays);
};

processInput(require("fs").readFileSync("/dev/stdin","utf8"));