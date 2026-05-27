'use strict';

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const extractNumericParameters = (sourceText) => {
  const [firstLine] = sourceText.trim().split('\n');
  const [valueOne, valueTwo] = firstLine.split(' ').map(Number);
  return { valueOne, valueTwo };
};

const resolveComparisonResult = (operandA, operandB) => {
  const comparisonOutcomes = {
    '1': 'a > b',
    '-1': 'a < b',
    '0': 'a == b'
  };
  return comparisonOutcomes[Math.sign(operandA - operandB)] || 'a == b';
};

const { valueOne, valueTwo } = extractNumericParameters(inputSource);

const finalOutputString = resolveComparisonResult(valueOne, valueTwo);

console.log(finalOutputString);
