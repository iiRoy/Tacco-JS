'use strict'

const getNumericTokenProvider = () => {
  const standardInputPath = '/dev/stdin';
  const fileSystemModule = require('fs');

  const readAndSplitInputContent = (filePath) => {
    const rawContent = fileSystemModule.readFileSync(filePath, 'utf8');
    return rawContent.trim().split(/\s+/);
  };

  const allInputTokens = readAndSplitInputContent(standardInputPath);
  let currentTokenIndex = 0;

  return () => {
    if (currentTokenIndex < allInputTokens.length) {
      const tokenValue = allInputTokens[currentTokenIndex];
      currentTokenIndex++;
      return tokenValue;
    }
    return undefined;
  };
};

const processAndOutputResult = (retrieveNextToken) => {
  const inputValues = [];
  const requiredInputCount = 3;

  for (let i = 0; i < requiredInputCount; i++) {
    const rawToken = retrieveNextToken();
    inputValues.push(+rawToken);
  }

  inputValues.sort((a, b) => a - b);

  const smallestNumber = inputValues[0];
  const middleNumber = inputValues[1];
  const largestNumber = inputValues[2];

  const multipliedLargest = largestNumber * 10;
  const finalCalculationResult = multipliedLargest + smallestNumber + middleNumber;

  console.log(finalCalculationResult);
};

processAndOutputResult(getNumericTokenProvider());
