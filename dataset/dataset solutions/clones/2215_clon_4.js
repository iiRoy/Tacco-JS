'use strict';

function processNumericalInput(sourceTextContent) {
  const numericalValues = sourceTextContent
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  const [firstOperand, secondOperand] = numericalValues;

  const characterEntity = Math.min(firstOperand, secondOperand).toString();
  const repetitionQuantity = Math.max(firstOperand, secondOperand);

  const finalSequence = characterEntity.repeat(repetitionQuantity);

  console.log(finalSequence);
}

processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));