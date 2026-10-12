'use strict';
(function(sourceText) {
  let numericComponents = [];
  let textSegments = sourceText.trim().split(/\s+/);

  let segmentIndex = 0;
  while (segmentIndex < textSegments.length) {
    let currentSegment = textSegments[segmentIndex];
    if (currentSegment !== '') {
      numericComponents.push(parseInt(currentSegment, 10));
    }
    segmentIndex++;
  }

  const firstValue = numericComponents[0];
  const secondValue = numericComponents[1];
  const thirdValue = numericComponents[2];

  const isFirstEven = (firstValue % 2 === 0);
  const isSumSecondThirdOdd = ((secondValue + thirdValue) % 2 === 1);

  const decisionMatrix = new Map();
  // Key format: "isFirstEven_isSumSecondThirdOdd"
  decisionMatrix.set('false_false', null); // K odd, X+Y even
  decisionMatrix.set('false_true', null);  // K odd, X+Y odd
  decisionMatrix.set('true_false', null);  // K even, X+Y even
  decisionMatrix.set('true_true', -1);     // K even, X+Y odd (this is the condition for -1)

  const currentConditionKey = `${isFirstEven}_${isSumSecondThirdOdd}`;
  const outputValue = decisionMatrix.get(currentConditionKey);

  if (outputValue !== null) {
    console.log(outputValue);
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
