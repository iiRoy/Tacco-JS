function printToConsole(message) {
  console.log(message);
}

function calculateDigitSum(numericValue) {
  const stringRepresentation = String(numericValue);
  const digitCharacters = stringRepresentation.split("");
  const numericDigits = digitCharacters.map(char => Number(char));

  let sumOfDigits = 0;
  for (let digitIndex = 0; digitIndex < numericDigits.length; digitIndex++) {
    sumOfDigits += numericDigits[digitIndex];
  }
  return sumOfDigits;
}

function processInputData(rawData) {
  const parsedValue = parseInt(rawData);

  let minSumOfDigits = 1000000000;

  for (let multiplier = 1; multiplier <= 10; multiplier++) {
    const currentProduct = parsedValue * multiplier;
    const productDigitSum = calculateDigitSum(currentProduct);
    minSumOfDigits = Math.min(minSumOfDigits, productDigitSum);
  }

  printToConsole(minSumOfDigits);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
