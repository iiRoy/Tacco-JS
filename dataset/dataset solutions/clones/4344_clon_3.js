function isValidFactorialInput(value) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

function multiplyDescending(currentValue) {
  if (currentValue <= 1) {
    return 1n;
  }

  const currentFactor = BigInt(currentValue);
  const remainingProduct = multiplyDescending(
    currentValue - 1
  );

  return currentFactor * remainingProduct;
}

function obtainFactorial(value) {
  if (!isValidFactorialInput(value)) {
    return null;
  }

  return multiplyDescending(value);
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const requestedValue = Number(source.trim());
const factorialValue = obtainFactorial(requestedValue);

if (factorialValue === null) {
  console.log("INVALID");
} else {
  console.log(factorialValue.toString());
}