function processInput(rawDataString) {
  const trimmedInput = rawDataString.trim();
  const stringComponents = trimmedInput.split(" ");

  const numericValues = stringComponents.map(valueStr => Number(valueStr));

  const firstOperand = numericValues[0];
  const secondOperand = numericValues[1];

  const additionResult = firstOperand + secondOperand;
  const subtractionResult = firstOperand - secondOperand;
  const multiplicationResult = firstOperand * secondOperand;

  const calculatedMaximum = Math.max(additionResult, subtractionResult, multiplicationResult);

  let finalOutputValue = calculatedMaximum;
  if (finalOutputValue === -0) {
    finalOutputValue = 0;
  }

  console.log(finalOutputValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
