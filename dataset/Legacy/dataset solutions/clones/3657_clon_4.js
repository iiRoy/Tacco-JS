const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericStrings = fileContent.split('\n')[1].split(' ');
const divisors = numericStrings.map(Number);

const computeRemainderSum = (dividendValue, divisorCollection) =>
  divisorCollection.reduce((accumulator, currentDivisor) => accumulator + (dividendValue % currentDivisor), 0);

const discoverPeakRemainder = (currentDividendCandidate, currentMaximumSum) => {
  const iterationSum = computeRemainderSum(currentDividendCandidate, divisors);

  if (iterationSum === 0) {
    return currentMaximumSum;
  }

  const updatedMaximum = Math.max(currentMaximumSum, iterationSum);

  return discoverPeakRemainder(currentDividendCandidate + 1, updatedMaximum);
};

const finalResult = discoverPeakRemainder(1, 0);

console.log(finalResult);
