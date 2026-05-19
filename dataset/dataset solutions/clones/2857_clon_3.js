function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const elementCount = parseInt(inputLines[0], 10);
  const weightsArray = inputLines[1].split(' ').map(val => parseInt(val, 10));

  const calculateSubarraySum = (arr, startIndex, endIndex) => {
    let currentSegmentSum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      currentSegmentSum += arr[i];
    }
    return currentSegmentSum;
  };

  const absoluteDifferenceResults = [];

  const overallTotalSum = calculateSubarraySum(weightsArray, 0, elementCount);

  for (let splitPointIndex = 1; splitPointIndex < elementCount; splitPointIndex++) {
    const firstSegmentSum = calculateSubarraySum(weightsArray, 0, splitPointIndex);
    const secondSegmentSum = overallTotalSum - firstSegmentSum;
    absoluteDifferenceResults.push(Math.abs(firstSegmentSum - secondSegmentSum));
  }

  console.log(Math.min(...absoluteDifferenceResults));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
