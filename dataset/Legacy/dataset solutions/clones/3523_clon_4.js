'use strict';

const acquireInputReader = () => {
  let currentTokenIndex = 0;
  let allTokens = [];

  const prepareTokenSource = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    allTokens = fileContent.trim().split(/\s+/);
  };

  prepareTokenSource();

  return () => {
    return allTokens[currentTokenIndex++];
  };
};

const executeCalculation = (fetchNextNumericToken) => {
  const firstValue = +fetchNextNumericToken();
  const secondValue = +fetchNextNumericToken();
  const thirdValue = +fetchNextNumericToken();

  const maximumValue = Math.max(firstValue, secondValue, thirdValue);
  const minimumValue = Math.min(firstValue, secondValue, thirdValue);
  const centralValue = firstValue + secondValue + thirdValue - maximumValue - minimumValue;

  console.log(maximumValue * 10 + minimumValue + centralValue);
};

executeCalculation(acquireInputReader());
