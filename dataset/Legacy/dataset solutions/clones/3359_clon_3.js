'use strict'

const parseNumericInput = (rawInputString) => {
  const firstLineContent = rawInputString.split('\n')[0];
  const stringComponents = firstLineContent.split(' ');
  return stringComponents.map(strValue => Number(strValue));
};

const processInputData = (rawData) => {
  const parsedNumbers = parseNumericInput(rawData);
  const valA = parsedNumbers[0];
  const valB = parsedNumbers[1];
  const valC = parsedNumbers[2];

  let resultValue;
  const sumOfAAndB = valA + valB;

  if (valC <= sumOfAAndB) {
    resultValue = valC + valB;
  } else {
    // Original: (C + B) - (C - B - A) + 1
    // Simplified: C + B - C + B + A + 1 => 2*B + A + 1
    resultValue = (2 * valB) + valA + 1;
  }
  console.log(resultValue);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
