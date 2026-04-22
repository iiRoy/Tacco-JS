const processData = (rawData) => {
  const contentSegments = rawData.split('\n');
  const elementCount = Number(contentSegments[0]);
  const initialNumericSequence = contentSegments[1].split(' ').map(Number);

  const modifiedSequence = initialNumericSequence
    .map((value, index) => value - (index + 1))
    .sort((a, b) => a - b);

  const centralAdjustment = (elementCount % 2 !== 0)
    ? modifiedSequence[Math.floor(elementCount / 2)]
    : Math.floor((modifiedSequence[elementCount / 2] + modifiedSequence[elementCount / 2 + 1]) / 2);

  const totalDeviation = modifiedSequence.reduce((acc, current) => {
    return acc + Math.abs(current - centralAdjustment);
  }, 0);

  console.log(totalDeviation);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));