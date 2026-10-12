function processInputData(rawDataString) {
  const parseNumbersFromString = (inputString) => {
    return inputString.split(' ').map(numString => Number(numString));
  };

  const parsedNumericValues = parseNumbersFromString(rawDataString);

  const firstValue = parsedNumericValues[0];
  const secondValue = parsedNumericValues[1];
  const thirdValue = parsedNumericValues[2];

  const calculateProduct = (operandA, operandB) => operandA * operandB;

  const calculatedProduct = calculateProduct(firstValue, secondValue);
  const comparisonTarget = thirdValue;

  const finalOutputValue = Math.min(calculatedProduct, comparisonTarget);

  console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
