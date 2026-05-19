function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function writeOutput(outputValue) {
  console.log(outputValue);
}

const CONVERSION_STRATEGIES = {
  0: (val) => val,
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(" "),
  3: (val) => val.split("\n"),
  4: (val) => val.split(" ").map((str) => Number(str)),
  5: (val) => val.split("\n").map((str) => Number(str)),
  6: (val) => val.split(""),
  7: (val) => val.split("").map((str) => Number(str)),
};

function processInput(inputValue, conversionType) {
  const strategyExecutor = CONVERSION_STRATEGIES[conversionType];
  if (strategyExecutor) {
    return strategyExecutor(inputValue);
  }
  return inputValue;
}

function updatePrimeFactorCounts(numberToFactor, countsArray) {
  let currentDivisor = 2;
  let tempNumber = numberToFactor;

  while (currentDivisor * currentDivisor <= tempNumber) {
    if (tempNumber % currentDivisor === 0) {
      countsArray[currentDivisor]++;
      tempNumber /= currentDivisor;
    } else {
      currentDivisor++;
    }
  }
  if (tempNumber > 1) {
    countsArray[tempNumber]++;
  }
}

function calculateDivisorProduct(nValueInput) {
  const targetNumber = processInput(nValueInput, 1);

  const primeFactorCounts = new Array(targetNumber + 1).fill(0);
  const MODULO_CONSTANT = 1000000007;

  for (let currentNumber = 2; currentNumber <= targetNumber; currentNumber++) {
    updatePrimeFactorCounts(currentNumber, primeFactorCounts);
  }

  let resultProduct = 1;
  const MIN_PRIME_INDEX = 2;

  for (let primeIndex = MIN_PRIME_INDEX; primeIndex < primeFactorCounts.length; primeIndex++) {
    const currentPrimeOccurrence = primeFactorCounts[primeIndex];
    if (currentPrimeOccurrence > 0) {
      const termForProduct = currentPrimeOccurrence + 1;
      resultProduct = (resultProduct * termForProduct) % MODULO_CONSTANT;
    }
  }

  writeOutput(resultProduct);
}

calculateDivisorProduct(readInput());
