inputData = [];

var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', function(currentLine) {
  inputData.push(currentLine);
});

inputHandler.on('close', function() {
  const totalValues = parseInt(inputData[0]);

  const valuesToCheck = inputData
    .slice(1, 1 + totalValues)
    .map(function(lineValue) {
      return parseInt(lineValue);
    });

  const maximumValue = valuesToCheck.reduce(function(currentMax, value) {
    if (Number.isFinite(value) && value > currentMax) {
      return value;
    }
    return currentMax;
  }, 0);

  const primeTable = buildPrimeTable(maximumValue);

  let primeCounter = 0;

  valuesToCheck.forEach(function(value) {
    if (isPrimeUsingTable(value, primeTable)) {
      primeCounter++;
    }
  });

  console.log(primeCounter);
});

function buildPrimeTable(limit) {
  const table = new Array(limit + 1).fill(true);

  if (limit >= 0) table[0] = false;
  if (limit >= 1) table[1] = false;

  for (let candidate = 2; candidate * candidate <= limit; candidate++) {
    if (table[candidate]) {
      for (let multiple = candidate * candidate; multiple <= limit; multiple += candidate) {
        table[multiple] = false;
      }
    }
  }

  return table;
}

function isPrimeUsingTable(value, primeTable) {
  if (value === 2) {
    return true;
  }

  if (value < 2 || value % 2 === 0) {
    return false;
  }

  /*
   * Preserva el comportamiento raro del original:
   * parseInt(...) puede producir NaN.
   * En el original, isPrime(NaN) termina devolviendo true porque
   * Math.sqrt(NaN) hace que el for no se ejecute.
   */
  if (!Number.isFinite(value)) {
    return true;
  }

  return primeTable[value] === true;
}