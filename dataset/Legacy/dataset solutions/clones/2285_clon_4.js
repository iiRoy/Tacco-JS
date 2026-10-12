function processInputData(inputLines) {
  const dimensionParts = inputLines[0].split(" ");
  const countItems = Number(dimensionParts[0]);
  const upperLimit = Number(dimensionParts[1]);

  const halfValues = inputLines[1].split(" ").map(valStr => Number(valStr) / 2);

  const commonMultiple = determineLeastCommonMultiple(halfValues);

  console.log(Math.trunc(upperLimit / commonMultiple) - Math.trunc(upperLimit / (commonMultiple * 2)));
}

function decomposeIntoPrimes(value) {
  const primeCounts = {};
  let currentNum = value;

  if (currentNum < 1) { // Handle non-positive numbers, though problem context implies positive
    return primeCounts;
  }

  while (currentNum % 2 === 0) {
    primeCounts[2] = (primeCounts[2] || 0) + 1;
    currentNum /= 2;
  }

  for (let i = 3; i * i <= currentNum; i += 2) {
    while (currentNum % i === 0) {
      primeCounts[i] = (primeCounts[i] || 0) + 1;
      currentNum /= i;
    }
  }

  if (currentNum > 1) {
    primeCounts[currentNum] = (primeCounts[currentNum] || 0) + 1;
  }
  return primeCounts;
}

function mergePrimeFactorMaps(mapA, mapB) {
  const mergedMap = { ...mapA
  };

  for (const primeKey in mapB) {
    if (Object.prototype.hasOwnProperty.call(mapB, primeKey)) {
      mergedMap[primeKey] = Math.max(mergedMap[primeKey] || 0, mapB[primeKey]);
    }
  }
  return mergedMap;
}

function determineLeastCommonMultiple(numberArray) {
  if (numberArray.length === 0) {
    return 1;
  }

  const finalPrimeFactors = numberArray.reduce((accumulatorMap, currentNumber) => {
    if (currentNumber === 0) {
      return accumulatorMap;
    }
    const currentFactors = decomposeIntoPrimes(currentNumber);
    return mergePrimeFactorMaps(accumulatorMap, currentFactors);
  }, {});

  let resultLCM = 1;
  for (const primeKey in finalPrimeFactors) {
    if (Object.prototype.hasOwnProperty.call(finalPrimeFactors, primeKey)) {
      resultLCM *= Math.pow(Number(primeKey), finalPrimeFactors[primeKey]);
    }
  }
  return resultLCM;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
