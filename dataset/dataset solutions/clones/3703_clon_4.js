function computeAbsoluteSum(offsetValue, inputNumbers) {
  const totalDeviation = inputNumbers.reduce((accumulator, currentValue, currentIndex) => {
    const targetTerm = offsetValue + currentIndex + 1;
    return accumulator + Math.abs(currentValue - targetTerm);
  }, 0);
  return totalDeviation;
}

function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const elementCount = parseInt(inputLines[0]);
  const originalValues = inputLines[1].split(' ').map(valStr => parseInt(valStr));

  const centralIndex = Math.floor(elementCount / 2);
  
  const adjustedValues = originalValues.map((val, idx) => val - (idx + 1));

  const primaryOffsetCandidate = adjustedValues[centralIndex];

  const candidateOffsets = [
    primaryOffsetCandidate,
    adjustedValues[centralIndex + 1], // Will be undefined if out of bounds
    adjustedValues[centralIndex + 2]  // Will be undefined if out of bounds
  ];

  const deviationResults = candidateOffsets.map(candidate => computeAbsoluteSum(candidate, originalValues));
  const minimumDeviation = Math.min(...deviationResults);

  console.log(minimumDeviation);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
