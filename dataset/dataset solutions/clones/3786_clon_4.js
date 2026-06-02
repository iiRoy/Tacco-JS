function processInput(rawText) {
  const parsedValues = rawText.trim().split(" ").map(Number);
  const [firstOperand, secondOperand] = parsedValues;

  const calculationMethods = [
    (x, y) => x + y,
    (x, y) => x - y,
    (x, y) => x * y
  ];

  const derivedValues = calculationMethods.map(method => method(firstOperand, secondOperand));

  const greatestValue = derivedValues.reduce((currentMaximum, currentValue) => {
    return currentValue > currentMaximum ? currentValue : currentMaximum;
  }, -Infinity);

  const normalizedResult = greatestValue + 0;

  console.log(normalizedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
