'use strict';
(function(inputData) {
  const parseInputNumbers = (rawString) => {
    const stringParts = rawString.toString().trim().split(' ');
    return stringParts.map(part => parseInt(part, 10));
  };

  const checkOrderCondition = (firstValue, secondValue, thirdValue) => {
    return firstValue < secondValue && secondValue < thirdValue;
  };

  const numericValues = parseInputNumbers(inputData);

  const [valA, valB, valC] = numericValues;

  let resultOutput;
  if (checkOrderCondition(valA, valB, valC)) {
    resultOutput = 'Yes';
  } else {
    resultOutput = 'No';
  }

  console.log(resultOutput);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
