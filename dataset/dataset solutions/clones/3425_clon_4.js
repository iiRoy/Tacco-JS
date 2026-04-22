const sourceStream = require('node:fs');

const rawData = sourceStream.readFileSync('/dev/stdin', 'utf8');

const calculateOptimalDeviation = (inputString) => {
  const desiredMagnitude = 753;
  let minimumDiscrepancy = Infinity;
  const stringLength = inputString.length;

  for (let pos = 0; pos <= stringLength - 3; ++pos) {
    const digitOne = inputString.charCodeAt(pos) - 48;
    const digitTwo = inputString.charCodeAt(pos + 1) - 48;
    const digitThree = inputString.charCodeAt(pos + 2) - 48;

    const currentNumericalValue = digitOne * 100 + digitTwo * 10 + digitThree;
    const currentDifference = Math.abs(currentNumericalValue - desiredMagnitude);

    if (currentDifference < minimumDiscrepancy) {
      minimumDiscrepancy = currentDifference;
    }
  }

  return minimumDiscrepancy;
};

console.log(calculateOptimalDeviation(rawData.trim()));