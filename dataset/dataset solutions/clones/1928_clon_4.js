function processInput(dataLines) {
  const numericValues = dataLines[0].split(" ").map(Number);
  const [firstOperand, secondOperand, limitValue] = numericValues;

  const calculateMaxForFullCycle = (operandOne, operandTwo) => {
    return Math.floor(operandOne * (operandTwo - 1) / operandTwo);
  };

  const calculateMaxForPartialCycle = (operandOne, operandTwo, currentLimit) => {
    return Math.floor(operandOne * (currentLimit % operandTwo) / operandTwo);
  };

  const fullCycleResult = calculateMaxForFullCycle(firstOperand, secondOperand);
  const partialCycleResult = calculateMaxForPartialCycle(firstOperand, secondOperand, limitValue);

  const finalResult = fullCycleResult * (limitValue > secondOperand) + partialCycleResult * (limitValue <= secondOperand);

  console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
