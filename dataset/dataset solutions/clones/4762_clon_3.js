function getInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(dataToDisplay) {
  console.log(dataToDisplay);
}

const conversionHandlers = {
  0: (val) => val,
  1: (val) => parseInt(val),
  2: (val) => val.split(" "),
  3: (val) => val.split("\n"),
  4: (val) => val.split(" ").map((item) => Number(item)),
  5: (val) => val.split("\n").map((item) => Number(item)),
  6: (val) => val.split(""),
  7: (val) => val.split("").map((item) => Number(item)),
};

function convertInput(inputValue, conversionType) {
  const handler = conversionHandlers[conversionType];
  if (handler) {
    return handler(inputValue);
  }
  return inputValue; // Default to returning original if type is unknown
}

function updatePrimeFactorCounts(numberToFactor, countsArray) {
  let currentFactorCandidate = numberToFactor;
  for (let divisor = 2; divisor <= currentFactorCandidate;) {
    if (currentFactorCandidate % divisor === 0) {
      countsArray[divisor]++;
      currentFactorCandidate /= divisor;
    } else {
      divisor++;
    }
  }
}

function processNumber(targetNumberInput) {
  const targetNumber = convertInput(targetNumberInput, 1);

  const primeFactorCounts = new Array(targetNumber + 1).fill(0);
  const moduloValue = 1000000007;

  for (let currentNum = 2; currentNum <= targetNumber; currentNum++) {
    updatePrimeFactorCounts(currentNum, primeFactorCounts);
  }

  let resultProduct = 1;
  for (let primeIndex = 2; primeIndex < primeFactorCounts.length; primeIndex++) {
    const countOfPrime = primeFactorCounts[primeIndex];
    if (countOfPrime !== 0) {
      const exponentPlusOne = countOfPrime + 1;
      resultProduct = (resultProduct * exponentPlusOne) % moduloValue;
    }
  }

  displayOutput(resultProduct);
}

processNumber(getInput());
