function performCalculation(firstNumber, secondNumber, operatorSymbol) {
  let operationResult;
  if (operatorSymbol === "+") {
    operationResult = firstNumber + secondNumber;
  } else {
    // Original code implies anything not '+' is '-', so we follow that behavior.
    operationResult = firstNumber - secondNumber;
  }
  return operationResult;
}

function processInput(rawInputString) {
  const WHITESPACE_DELIMITER = " ";
  const cleanedInput = rawInputString.trim();
  const inputPartsArray = cleanedInput.split(WHITESPACE_DELIMITER);

  const operandOne = parseInt(inputPartsArray[0], 10);
  const operatorCharacter = inputPartsArray[1];
  const operandTwo = parseInt(inputPartsArray[2], 10);

  const finalComputedValue = performCalculation(operandOne, operandTwo, operatorCharacter);

  console.log(finalComputedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
