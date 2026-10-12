const processData = (rawData) => {
  const [elementCountStr, valueString] = rawData.split('\n');
  const numericValues = valueString.split(' ').map(Number);

  const middleIndices = Array.from({ length: Math.max(0, numericValues.length - 2) }, (_, k) => k + 1);

  const monotonicTriplets = middleIndices.reduce((accumulator, currentIdx) => {
    const priorVal = numericValues[currentIdx - 1];
    const centralVal = numericValues[currentIdx];
    const subsequentVal = numericValues[currentIdx + 1];

    if ((priorVal - centralVal) * (centralVal - subsequentVal) > 0) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);

  console.log(monotonicTriplets);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
