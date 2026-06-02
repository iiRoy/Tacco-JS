const MOD_VAL = 1000000007;

const computeFactorialModulo = (val) => {
  if (val < 0) {
    return 0;
  }
  if (val === 0) {
    return 1;
  }
  return Array.from({ length: val }, (_, idx) => idx + 1)
    .reduce((accumulator, currentElement) => (accumulator * currentElement) % MOD_VAL, 1);
};

function processInputData(rawData) {
  const [firstNumber, secondNumber] = rawData.trim().split(' ').map(Number);

  const absoluteDifference = Math.abs(firstNumber - secondNumber);

  let finalOutputValue;

  if (absoluteDifference >= 2) {
    finalOutputValue = 0;
  } else {
    const factorialA = computeFactorialModulo(firstNumber);
    const factorialB = computeFactorialModulo(secondNumber);

    let productIntermediate = (factorialA * factorialB) % MOD_VAL;

    if (absoluteDifference === 0) {
      productIntermediate = (productIntermediate * 2) % MOD_VAL;
    }

    finalOutputValue = productIntermediate;
  }

  console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
