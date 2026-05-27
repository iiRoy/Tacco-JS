function padWithZeros(inputString, targetLength) {
  const paddingChars = '0'.repeat(targetLength);
  return (paddingChars + inputString).slice(-targetLength);
}

function calculateCombinationStats(binaryRepresentation, dataElements) {
  let currentSum = 0;
  let oneCount = 0;
  const numElements = binaryRepresentation.length;
  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    if (binaryRepresentation[elementIndex] === '1') {
      currentSum += parseInt(dataElements[elementIndex], 10);
      oneCount++;
    }
  }
  return { sum: currentSum, count: oneCount };
}

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineParts = inputLines[0].split(' ');
  const countN = parseInt(firstLineParts[0], 10);
  const targetAverage = parseInt(firstLineParts[1], 10);

  const dataElements = inputLines[1].split(' ');

  let validCombinationsCount = 0;
  const maxCombinations = 1 << countN;

  for (let combinationIndex = 1; combinationIndex < maxCombinations; combinationIndex++) {
    const binaryRepresentation = padWithZeros(combinationIndex.toString(2), countN);

    const stats = calculateCombinationStats(binaryRepresentation, dataElements);

    if (stats.count > 0 && targetAverage === stats.sum / stats.count) {
      validCombinationsCount++;
    }
  }

  console.log(validCombinationsCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
