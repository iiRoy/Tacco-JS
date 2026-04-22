const analyzeData = (inputString) => {
  const numericComponents = inputString
    .trim()
    .split('\n')
    .reduce((accumulator, currentLine, index) => {
      const parsedNumericValue = parseInt(currentLine, 10);

      if (index === 0) accumulator.firstElement = parsedNumericValue;
      if (index === 4) accumulator.fifthElement = parsedNumericValue;
      if (index === 5) accumulator.sixthElement = parsedNumericValue;
      
      return accumulator;
    }, {});

  const { firstElement, fifthElement, sixthElement } = numericComponents;

  const comparisonOutcome = (fifthElement - firstElement <= sixthElement);

  const resultMapping = new Map([
    [true, 'Yay!'],
    [false, ':(']
  ]);

  console.log(resultMapping.get(comparisonOutcome));
};

const initiateProcessing = (resourceIdentifier) => {
  const fileContent = require('fs').readFileSync(resourceIdentifier, 'utf8');
  analyzeData(fileContent);
};

initiateProcessing('/dev/stdin');