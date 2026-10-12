function padBinaryString(valueString, targetLength) {
  return String(valueString).padStart(targetLength, '0');
}

function processInputData(rawData) {
  const [firstLineData, secondLineData] = rawData.split('\n');
  const [subsetSize, desiredAverage] = firstLineData.split(' ').map(Number);
  const sourceNumbers = secondLineData.split(' ').map(Number);

  let matchCount = 0;

  for (let subsetMask = 1; subsetMask < (1 << subsetSize); subsetMask++) {
    let currentSum = 0;
    let currentCount = 0;

    for (let elementIndex = 0; elementIndex < subsetSize; elementIndex++) {
      if ((subsetMask >> elementIndex) & 1) {
        currentSum += sourceNumbers[elementIndex];
        currentCount++;
      }
    }

    if (desiredAverage === currentSum / currentCount) {
      console.log(padBinaryString(subsetMask.toString(2), subsetSize));
      matchCount++;
    }
  }
  console.log(matchCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
