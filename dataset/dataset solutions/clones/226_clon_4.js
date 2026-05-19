const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync(process.stdin.fd, 'utf8');

const numericQueries = rawInputData
  .split('\n')
  .map(line => Number(line.trim()))
  .filter(val => !isNaN(val) && val > 0);

initiateCalculation();

function initiateCalculation() {
  const primeSumCounts = computePrimePairSums();

  for (const queryValue of numericQueries) {
    console.log(primeSumCounts[queryValue]);
  }
}

function computePrimePairSums() {
  const UPPER_BOUND = 50000;
  const sieveArray = new Uint8Array(UPPER_BOUND + 1);
  const collectedPrimes = [];

  sieveArray[0] = 1;
  sieveArray[1] = 1;

  for (let currentNum = 2; currentNum * currentNum <= UPPER_BOUND; currentNum++) {
    if (sieveArray[currentNum] === 0) {
      for (let multiple = currentNum * currentNum; multiple <= UPPER_BOUND; multiple += currentNum) {
        sieveArray[multiple] = 1;
      }
    }
  }

  for (let num = 2; num <= UPPER_BOUND; num++) {
    if (sieveArray[num] === 0) {
      collectedPrimes.push(num);
    }
  }

  const sumTally = new Uint16Array(UPPER_BOUND + 1);

  for (let idx1 = 0; idx1 < collectedPrimes.length; idx1++) {
    const prime1 = collectedPrimes[idx1];

    for (let idx2 = 0; idx2 <= idx1; idx2++) {
      const prime2 = collectedPrimes[idx2];
      const currentSum = prime1 + prime2;

      if (currentSum <= UPPER_BOUND) {
        sumTally[currentSum]++;
      } else {
        break;
      }
    }
  }

  return sumTally;
}
