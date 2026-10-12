function calculateSpecialCount(rawInputString) {
  const inputParts = rawInputString.split(' ');
  const numericValues = inputParts.map(strVal => Number(strVal));

  const [upperLimitN, targetThresholdK] = numericValues;

  let finalCount = 0;
  const LOOP_START_VALUE = 1;

  const checkModuloCondition = (dividend, divisor, threshold) => {
    const remainder = dividend % divisor;
    return remainder >= threshold;
  };

  for (let currentI = LOOP_START_VALUE; currentI <= upperLimitN; currentI++) {
    for (let currentJ = LOOP_START_VALUE; currentJ <= upperLimitN; currentJ++) {
      if (checkModuloCondition(currentI, currentJ, targetThresholdK)) {
        finalCount++;
      }
    }
  }

  console.log(finalCount);
}

calculateSpecialCount(require('fs').readFileSync('/dev/stdin', 'utf-8'));
