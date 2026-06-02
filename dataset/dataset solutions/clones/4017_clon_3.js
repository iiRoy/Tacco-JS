"use strict"

const processInputAndCalculate = (rawInputData) => {
  const processedLines = rawInputData.split("\n");
  const firstLineContent = processedLines[0];
  const magicNumberNine = 9;

  if (firstLineContent.length === 1) {
    console.log(magicNumberNine.toString());
    return;
  }

  const remainingDigitsCount = firstLineContent.length - 1;
  const initialDigitValue = Number(firstLineContent.charAt(0)) - 1;

  const productOfRemaining = remainingDigitsCount * magicNumberNine;
  const finalComputedValue = initialDigitValue + productOfRemaining;

  console.log(finalComputedValue.toString());
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
