function processInput(rawData) {
  const inputDelimiter = " ";
  const parsedValues = rawData.split(inputDelimiter);

  const parseIntegerBase10 = (valueString) => {
    return parseInt(valueString, 10);
  };

  const firstOperand = parseIntegerBase10(parsedValues[0]);
  const secondOperand = parseIntegerBase10(parsedValues[1]);

  let finalResult = 0;

  const initialContribution = firstOperand - 1;
  finalResult += initialContribution;

  const isSecondOperandLargerOrEqual = secondOperand >= firstOperand;

  if (isSecondOperandLargerOrEqual) {
    const conditionalContribution = 1;
    finalResult += conditionalContribution;
  }

  console.log(finalResult);
}

const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInput(standardInputContent);
