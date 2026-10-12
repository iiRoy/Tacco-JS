const processValue = (rawText) => {
  const numericVal = Number(rawText.trim());
  const exponents = [1, 2, 3];
  return exponents.reduce((accumulatedSum, currentExponent) => {
    return accumulatedSum + Math.pow(numericVal, currentExponent);
  }, 0);
};

console.log(processValue(require('node:fs').readFileSync('/dev/stdin', 'utf8')));
