"use strict";

const processRawInput = (sourceText) => {
  const numericStrings = sourceText.split(" ");
  return numericStrings.map(val => Number(val));
};

const deriveFinalValue = (initialParameters) => {
  const [paramA, paramB, paramC] = initialParameters;

  // First stage calculation: interaction between paramB and paramC
  // Original logic:
  // if(b >= c) { ans += c+b; c = 0; }
  // else { ans += b*2; c- = b, b = 0; }
  // This can be expressed arithmetically:
  const firstStageContribution = Math.min(paramB, paramC) * 2 + Math.max(0, paramB - paramC);
  const remainingC_after_B = Math.max(0, paramC - paramB);

  // Second stage calculation: interaction between remainingC and paramA
  // Original logic:
  // if(c>0) { var tmp = Math.min(c,a); c -= tmp; ans += tmp; }
  // This can be expressed arithmetically:
  const amountFromA = Math.min(remainingC_after_B, paramA);
  const remainingC_after_A = remainingC_after_B - amountFromA;
  const secondStageContribution = amountFromA;

  // Third stage calculation: final adjustment for any remaining C
  // Original logic:
  // if(c>0) ans++;
  // This can be expressed arithmetically:
  const finalAdjustment = Math.ceil(Math.min(1, remainingC_after_A));

  return firstStageContribution + secondStageContribution + finalAdjustment;
};

const executeComputation = (inputData) => {
  const parsedValues = processRawInput(inputData);
  console.log(deriveFinalValue(parsedValues));
};

executeComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));
