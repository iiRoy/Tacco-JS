const solveProblem = rawData => {
  const stringParts = rawData.split(' ');
  const numericValues = stringParts.map(strItem => Number(strItem));

  const performCeilingDivision = (dividend, divisor) => {
    return Math.ceil(dividend / divisor);
  };

  const firstComputedValue = performCeilingDivision(numericValues[2], numericValues[1]);
  const secondComputedValue = performCeilingDivision(numericValues[0], numericValues[3]);

  const productForFirstAux = numericValues[3] * secondComputedValue;
  const auxiliaryCalculationOne = numericValues[0] - productForFirstAux;

  const productForSecondAux = numericValues[1] * firstComputedValue;
  const auxiliaryCalculationTwo = numericValues[2] - productForSecondAux;

  const areValuesIdentical = firstComputedValue === secondComputedValue;
  console.log(areValuesIdentical ? 'Yes' : 'No');
};

const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
solveProblem(standardInputContent);
