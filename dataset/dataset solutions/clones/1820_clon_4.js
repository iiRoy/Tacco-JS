function processInput(inputString) {
  let initialValue = BigInt(inputString);

  if (initialValue === 1n) {
    return '0';
  }

  let factorTally = 0;
  let currentNumber = initialValue;
  const knownPrimes = [];

  const checkAndFactor = (divisorCandidate) => {
    let powerAccumulator = divisorCandidate;
    let foundFactor = false;
    while (powerAccumulator <= currentNumber) {
      if (currentNumber % powerAccumulator === 0n) {
        factorTally++;
        currentNumber /= powerAccumulator;
        foundFactor = true;
      } else {
        break;
      }
      // Prevent overflow for z*=p if N is very large and p is small
      if (powerAccumulator > currentNumber / divisorCandidate) { // Check before multiplication
          break;
      }
      powerAccumulator *= divisorCandidate;
    }
    return foundFactor;
  };

  const isConsideredPrime = (num, primesList, limit) => {
    for (const prime of primesList) {
      if (prime * prime > limit) { // This is the original's specific limit, not num
        break;
      }
      if (num % prime === 0n) {
        return false;
      }
    }
    return true;
  };

  let candidate = 2n;
  while (candidate * candidate <= currentNumber || candidate === currentNumber) {
    if (isConsideredPrime(candidate, knownPrimes, currentNumber)) {
      knownPrimes.push(candidate);
      checkAndFactor(candidate);
    }
    candidate++;
  }

  if (factorTally === 0) {
    factorTally = 1;
  }

  return factorTally.toString();
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInput(inputData));
