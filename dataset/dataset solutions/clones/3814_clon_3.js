function processInputAndCalculate(inputStringData) {
  const rawInputLines = inputStringData.split("\n");
  const inputNumbers = rawInputLines.map(valueStr => Number(valueStr));

  const totalCount = inputNumbers[0];

  const sequenceTracker = new Array(totalCount + 1).fill(0);

  for (let currentIdx = 1; currentIdx <= totalCount; currentIdx++) {
    const currentValue = inputNumbers[currentIdx];
    // This line directly mirrors the original logic, including potential NaN propagation
    // if currentValue is 0 (as sequenceTracker[-1] would be undefined).
    sequenceTracker[currentValue] = sequenceTracker[currentValue - 1] + 1;
  }

  let longestSequenceLength = 0;
  for (let currentIdx = 0; currentIdx <= totalCount; currentIdx++) {
    const currentSequenceValue = sequenceTracker[currentIdx];
    if (currentSequenceValue > longestSequenceLength) {
      longestSequenceLength = currentSequenceValue;
    }
  }

  console.log(totalCount - longestSequenceLength);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
