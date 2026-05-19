function calculateProductFromInput(sourceData) {
  const separatorPosition = sourceData.indexOf(' ');
  const firstOperandString = sourceData.substring(0, separatorPosition);
  const secondOperandString = sourceData.substring(separatorPosition + 1);

  const firstNumericValue = Number(firstOperandString);
  const secondNumericValue = Number(secondOperandString);

  console.log(firstNumericValue * secondNumericValue);
}

calculateProductFromInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
