const padWithLeadingZeros = (numberString, targetLength) => {
  return String(numberString).padStart(targetLength, '0');
};

function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineValues = inputLines[0].split(' ').map(Number);
  const subsetSize = firstLineValues[0];
  const targetAverage = firstLineValues[1];

  const valueArray = inputLines[1].split(' ').map(Number);

  const totalCombinations = 1 << subsetSize;
  let validCombinationCount = 0;

  for (let combinationIndex = 1; combinationIndex < totalCombinations; combinationIndex++) {
    const binaryRepresentation = padWithLeadingZeros(combinationIndex.toString(2), subsetSize);

    let currentSum = 0;
    let oneCount = 0;

    for (let elementIndex = 0; elementIndex < subsetSize; elementIndex++) {
      if (binaryRepresentation[elementIndex] === '1') {
        currentSum += valueArray[elementIndex];
        oneCount++;
      }
    }

    if (oneCount === 0) {
      continue;
    }

    if (targetAverage === currentSum / oneCount) {
      console.log(binaryRepresentation);
      validCombinationCount++;
    }
  }
  console.log(validCombinationCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
