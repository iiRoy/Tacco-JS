const processSequenceData = (rawData) => {
  const numericValues = rawData.split('\n').map(Number);
  const totalElements = numericValues[0];
  const inputSequence = numericValues.slice(1);

  const consecutiveLengths = inputSequence.reduce((lengthMap, currentVal) => {
    lengthMap.set(currentVal, (lengthMap.get(currentVal - 1) || 0) + 1);
    return lengthMap;
  }, new Map());

  const longestSubsequenceLength = Array.from(consecutiveLengths.values()).reduce((maxFound, currentLength) => Math.max(maxFound, currentLength), 0);

  console.log(totalElements - longestSubsequenceLength);
};

processSequenceData(require("fs").readFileSync("/dev/stdin","utf8"));
