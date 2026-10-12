function calculateDeviationSum(baseValue, dataArray) {
  let totalDeviation = 0;
  for (let idx = 0; idx < dataArray.length; idx++) {
    const targetTerm = baseValue + idx + 1;
    totalDeviation += Math.abs(dataArray[idx] - targetTerm);
  }
  return totalDeviation;
}

function parseNumberArray(numberString) {
  return numberString.split(' ').map(item => parseInt(item, 10));
}

function determineOptimalBase(sortedDifferences, arrayLength) {
  const medianIdx = Math.floor(arrayLength / 2);
  let optimalBase;

  if (arrayLength % 2 === 0) {
    const firstMedianElement = sortedDifferences[medianIdx];
    const secondMedianElement = sortedDifferences[medianIdx + 1];
    optimalBase = Math.floor((firstMedianElement + secondMedianElement) / 2);
  } else {
    optimalBase = sortedDifferences[medianIdx];
  }
  return optimalBase;
}

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const arrayLength = parseInt(inputLines[0], 10);
  const originalArray = parseNumberArray(inputLines[1]);

  const differences = originalArray.map((value, index) => value - (index + 1));
  
  differences.sort((a, b) => a - b);

  const optimalBase = determineOptimalBase(differences, arrayLength);

  const finalDeviation = calculateDeviationSum(optimalBase, originalArray);

  console.log(finalDeviation);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
