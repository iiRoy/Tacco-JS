function obtainPrimes(limit) {
  const nonPrimes = new Set([0, 1]);

  for (let factor = 2; factor * factor <= limit; factor++) {
    if (!nonPrimes.has(factor)) {
      for (let multiple = factor * factor; multiple <= limit; multiple += factor) {
        nonPrimes.add(multiple);
      }
    }
  }

  const primeList = [];
  for (let num = 2; num <= limit; num++) {
    if (!nonPrimes.has(num)) {
      primeList.push(num);
    }
  }
  return primeList;
}

const primeNumbers = obtainPrimes(50000);
const primeLookup = new Set(primeNumbers);

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericQueries = rawInput.trim().split('\n').filter(Boolean).map(Number);

for (const targetSum of numericQueries) {
  if (targetSum === 0) {
    break;
  }

  const uniqueCombinations = new Set();
  for (const pA of primeNumbers) {
    if (pA >= targetSum) {
      break;
    }

    const pB = targetSum - pA;

    if (pB < pA) {
      continue;
    }

    if (primeLookup.has(pB)) {
      uniqueCombinations.add(`${Math.min(pA, pB)},${Math.max(pA, pB)}`);
    }
  }
  console.log(uniqueCombinations.size);
}
