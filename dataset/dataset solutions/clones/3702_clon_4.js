function computeDeviationSum(baseValue, dataPoints) {
  const totalDeviation = dataPoints.reduce((accumulator, currentVal, idx) => {
    return accumulator + Math.abs(currentVal - (baseValue + idx + 1));
  }, 0);
  return totalDeviation;
}

function processInputAndCalculate(rawData) {
  const inputLines = rawData.split('\n');
  const elementCount = parseInt(inputLines[0]);
  const initialValues = inputLines[1].split(' ').map(valStr => parseInt(valStr));

  const adjustedSortedValues = initialValues
    .map((value, index) => value - (index + 1))
    .sort((first, second) => first - second);

  const midpointIndex = Math.floor(elementCount / 2);

  const optimalOffset = (elementCount % 2 === 0)
    ? Math.floor((adjustedSortedValues[midpointIndex - 1] + adjustedSortedValues[midpointIndex]) / 2)
    : adjustedSortedValues[midpointIndex];

  const finalOutcome = computeDeviationSum(optimalOffset, initialValues);

  console.log(finalOutcome);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
