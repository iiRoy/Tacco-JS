'use strict';
(function(inputContent) {
  const fullInputString = inputContent.toString();
  const firstLineOfInput = fullInputString.split('\n')[0];
  const stringTokens = firstLineOfInput.split(' ');
  const parsedNumbers = stringTokens.map(Number);

  const displayComparisonResult = (conditionMet) => {
    if (conditionMet) {
      console.log('Yes');
    } else {
      console.log('No');
    }
  };

  const performConditionalCheck = (numA, numB, numC) => {
    const isFirstConditionTrue = numA < numB;
    const coercedBooleanValue = isFirstConditionTrue ? 1 : 0;
    const finalEvaluation = coercedBooleanValue < numC;
    displayComparisonResult(finalEvaluation);
  };

  const firstParam = parsedNumbers[0];
  const secondParam = parsedNumbers[1];
  const thirdParam = parsedNumbers[2];

  performConditionalCheck(firstParam, secondParam, thirdParam);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
