function calculateDeviationSum(baseValue, dataArray) {
  const totalDeviation = dataArray.reduce((accumulator, currentValue, currentIndex) => {
    const targetOffset = currentIndex + 1;
    const targetValue = baseValue + targetOffset;
    return accumulator + Math.abs(currentValue - targetValue);
  }, 0);
  return totalDeviation;
}

function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const arrayLength = parseInt(inputLines[0], 10);
  const originalNumbers = inputLines[1].split(' ').map(numStr => parseInt(numStr, 10));

  const midPointIndex = Math.floor(arrayLength / 2);

  const transformedNumbers = originalNumbers.map((val, idx) => {
    const currentOffset = idx + 1;
    return val - currentOffset;
  });

  const medianBase = transformedNumbers[midPointIndex];

  const candidateBases = [
    medianBase,
    transformedNumbers[midPointIndex + 1],
    transformedNumbers[midPointIndex + 2]
  ];

  const deviationResults = candidateBases.map(candidate =>
    calculateDeviationSum(candidate, originalNumbers)
  );

  const finalResult = Math.min(...deviationResults);

  console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
