((inputData) => {

  const digitAtPosition = (numericString, position) =>
    (position >= 0 ? parseInt(numericString[position], 10) : 0);

  const recursiveSummation = (operandX, operandY, indexX, indexY, carryValue, partialSumString) => {
    if (indexX < 0 && indexY < 0 && carryValue === 0) {
      return partialSumString;
    }

    const digitX = digitAtPosition(operandX, indexX);
    const digitY = digitAtPosition(operandY, indexY);

    const currentTotal = digitX + digitY + carryValue;
    const currentResultDigit = currentTotal % 10;
    const nextCarryValue = Math.floor(currentTotal / 10);

    return recursiveSummation(operandX, operandY, indexX - 1, indexY - 1, nextCarryValue, currentResultDigit + partialSumString);
  };

  const addStringNumbers = (firstOperand, secondOperand) =>
    recursiveSummation(firstOperand, secondOperand, firstOperand.length - 1, secondOperand.length - 1, 0, '');

  const displayOutcome = (computedSummation) =>
    computedSummation.length >= 80
      ? process.stdout.write('overflow\n')
      : process.stdout.write(computedSummation + '\n');

  const traverseAndCompute = (pendingSegments) => {
    if (pendingSegments.length === 0) {
      return;
    }

    const firstOperand = pendingSegments[0];
    const secondOperand = pendingSegments[1];
    const computedSummation = addStringNumbers(firstOperand, secondOperand);

    displayOutcome(computedSummation);

    traverseAndCompute(pendingSegments.slice(2));
  };

  const dataSegments = inputData.trim().split('\n');
  const payloadSegments = dataSegments.slice(1);

  traverseAndCompute(payloadSegments);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));