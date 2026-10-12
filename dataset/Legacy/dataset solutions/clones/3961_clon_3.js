function processData(rawDataString) {
  const trimmedInput = rawDataString.trim();

  const stringSegments = trimmedInput.split(" ");

  const numericValues = [];
  for (let i = 0; i < stringSegments.length; i++) {
    numericValues.push(Number(stringSegments[i]));
  }

  const firstOperand = numericValues[0];
  const secondOperand = numericValues[1];
  const comparisonTarget = numericValues[2];

  const calculateSum = (val1, val2) => {
    return val1 + val2;
  };

  const sumResult = calculateSum(firstOperand, secondOperand);

  const evaluateCondition = (currentSum, targetValue) => {
    return currentSum >= targetValue;
  };

  const conditionMet = evaluateCondition(sumResult, comparisonTarget);

  const finalOutput = conditionMet ? "Yes" : "No";

  console.log(finalOutput);
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
processData(fileData);
