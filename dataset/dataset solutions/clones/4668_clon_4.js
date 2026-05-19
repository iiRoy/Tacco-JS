const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const targetNumber = Number(inputLines.shift());

const getDigitCount = (value) => Math.floor(Math.log10(value)) + 1;

const determineDivisors = (num) => {
  const factorSet = new Set();
  for (let currentFactor = 1; currentFactor * currentFactor <= num; currentFactor++) {
    if (num % currentFactor === 0) {
      factorSet.add(currentFactor);
      factorSet.add(num / currentFactor);
    }
  }
  return Array.from(factorSet).sort((val1, val2) => val1 - val2);
};

const factorList = determineDivisors(targetNumber);

const minimumDigits = factorList.reduce((currentMin, factorB) => {
  const factorA = targetNumber / factorB;
  const currentMaxDigits = Math.max(getDigitCount(factorA), getDigitCount(factorB));
  return Math.min(currentMin, currentMaxDigits);
}, getDigitCount(targetNumber));

console.log(minimumDigits);
