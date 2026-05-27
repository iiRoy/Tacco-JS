"use strict";

const processInputData = (sourceContent) => {
  const contentSegments = sourceContent.split("\n");
  const primarySegment = contentSegments[0];

  const deriveDigitSum = (numericalString) => {
    return Array.from(numericalString).reduce((accumulatedValue, charElement) => {
      return accumulatedValue + +charElement;
    }, 0);
  };

  if (primarySegment.length === 1) {
    console.log('9');
    return;
  }

  const initialCharacter = primarySegment.charAt(0);
  const trailingNineCount = primarySegment.length - 1;

  const constructedString = initialCharacter + '9'.repeat(trailingNineCount);

  const finalComputedValue = deriveDigitSum(constructedString) - 1;

  console.log(finalComputedValue);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
