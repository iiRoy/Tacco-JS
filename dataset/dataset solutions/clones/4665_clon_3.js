const getNumberStringLength = (numericValue) => String(numericValue).length;

function calculateMinFactorLength(rawInputString) {
  const targetNumber = parseInt(rawInputString, 10);

  let minFactorStringLength = getNumberStringLength(targetNumber);

  const squareRootOfTarget = Math.sqrt(targetNumber);

  for (let currentDivisorCandidate = 0; currentDivisorCandidate < squareRootOfTarget; currentDivisorCandidate++) {
    const isPositiveDivisor = currentDivisorCandidate > 0;
    const dividesEvenly = targetNumber % currentDivisorCandidate === 0;

    if (isPositiveDivisor && dividesEvenly) {
      const lengthOfCurrentDivisor = getNumberStringLength(currentDivisorCandidate);
      const otherFactorInPair = targetNumber / currentDivisorCandidate;
      const lengthOfOtherFactor = getNumberStringLength(otherFactorInPair);

      const currentMaxFactorPairLength = Math.max(lengthOfCurrentDivisor, lengthOfOtherFactor);

      if (currentMaxFactorPairLength < minFactorStringLength) {
        minFactorStringLength = currentMaxFactorPairLength;
      }
    }
  }

  console.log('%s', minFactorStringLength);
}

const fileSystemModule = require("fs");
const inputDataFromFile = fileSystemModule.readFileSync("/dev/stdin", "utf8");
calculateMinFactorLength(inputDataFromFile);
