const processInput = (inputData) => {
  const SIEVE_UPPER_BOUND = 55555;
  const desiredCount = parseInt(inputData, 10);

  const determineSpecialPrimes = (limit, countTarget) => {
    const isNumberPrime = Array(limit).fill(true);
    const collectedPrimes = [];
    let currentNumberCandidate = 2;

    while (currentNumberCandidate < limit) {
      if (isNumberPrime[currentNumberCandidate]) {
        let multipleOfPrime = currentNumberCandidate * 2;
        while (multipleOfPrime < limit) {
          isNumberPrime[multipleOfPrime] = false;
          multipleOfPrime += currentNumberCandidate;
        }

        const moduloResult = currentNumberCandidate % 5;
        if (moduloResult === 1) {
          collectedPrimes.push(currentNumberCandidate);
          if (collectedPrimes.length === countTarget) {
            break;
          }
        }
      }
      currentNumberCandidate++;
    }
    return collectedPrimes;
  };

  const finalPrimes = determineSpecialPrimes(SIEVE_UPPER_BOUND, desiredCount);
  return finalPrimes.join(' ');
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const outputResult = processInput(fileContent);
console.log(outputResult);
