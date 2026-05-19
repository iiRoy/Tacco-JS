function calculateArraySum(dataElements) {
  return dataElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function computeMean(dataPoints) {
  if (dataPoints.length === 0) {
    return 0;
  }
  const totalSum = calculateArraySum(dataPoints);
  return totalSum / dataPoints.length;
}

function computeVariance(dataPoints, meanValue) {
  if (dataPoints.length === 0) {
    return 0;
  }
  const sumOfSquaredDifferences = dataPoints.reduce((accumulator, currentValue) => {
    const differenceFromMean = currentValue - meanValue;
    return accumulator + (differenceFromMean * differenceFromMean);
  }, 0);
  return sumOfSquaredDifferences / dataPoints.length;
}

function processInputData(inputLines) {
  let currentLineIdx = 0;

  while (true) {
    const rawItemCountStr = inputLines[currentLineIdx++];
    const itemCount = parseInt(rawItemCountStr, 10);

    if (itemCount === 0) {
      break;
    }

    const rawNumericValuesStr = inputLines[currentLineIdx++];
    const numericValues = rawNumericValuesStr.split(/\s+/).map(parseFloat);

    const meanValue = computeMean(numericValues);
    const dataVariance = computeVariance(numericValues, meanValue);
    const stdDev = Math.sqrt(dataVariance);

    console.log(stdDev.toFixed(6));
  }
}

const inputBufferParts = [];
process.stdin.on('data', (dataChunk) => {
  inputBufferParts.push(dataChunk);
});
process.stdin.on('end', () => {
  const fullInputString = inputBufferParts.join('');
  const splitInputLines = fullInputString.split('\n');
  processInputData(splitInputLines);
});
