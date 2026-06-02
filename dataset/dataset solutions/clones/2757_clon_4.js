const processInputAndOutput = (rawText) => {
  const [firstOperand, secondOperand, thirdValue] = rawText.split(' ').map(Number);

  const computedProduct = firstOperand * secondOperand;

  console.log(Math.min(computedProduct, thirdValue));
};

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
