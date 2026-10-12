function processData(rawInputString) {
  const INPUT_DELIMITER = ' ';

  const parseValueToFloat = (valueString) => parseFloat(valueString);

  const numericValues = rawInputString.split(INPUT_DELIMITER).map(parseValueToFloat);

  const operandOne = numericValues[0];
  const operandTwo = numericValues[1];

  const performMultiplication = (valA, valB) => valA * valB;

  const productValue = performMultiplication(operandOne, operandTwo);

  const applyCeiling = (numberToCeil) => Math.ceil(numberToCeil);

  const finalResult = applyCeiling(productValue);

  console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
