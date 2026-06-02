const processInputAndCompute = (inputDataString) => {
  const trimmedInputContent = inputDataString.trim();
  const spaceSeparatedParts = trimmedInputContent.split(' ');

  const numericComponents = spaceSeparatedParts.map(currentStringValue => parseInt(currentStringValue, 10));

  const firstOperand = numericComponents[0];
  const secondOperand = numericComponents[1];
  const thirdOperand = numericComponents[2];

  const conditionalFactor = (thirdOperand === 0) ? 1 : 2;
  const differenceTerm = firstOperand - thirdOperand;
  const divisorTerm = firstOperand * firstOperand;
  const ratioExpression = differenceTerm / divisorTerm;
  const adjustmentFactor = secondOperand - 1;

  const finalComputedValue = conditionalFactor * ratioExpression * adjustmentFactor;

  return `${finalComputedValue}`;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputAndCompute(fileContent));
