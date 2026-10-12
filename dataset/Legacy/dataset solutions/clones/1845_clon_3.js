'use strict';

const logOutput = message => console.log(message);

function determineDigitCategory(digitCharacter) {
  const ponCategoryDigits = ['0', '1', '6', '8'];
  const bonCategoryDigit = '3';

  if (digitCharacter === bonCategoryDigit) {
    return 'bon';
  } else if (ponCategoryDigits.includes(digitCharacter)) {
    return 'pon';
  } else {
    return 'hon';
  }
}

function processInputData(rawData) {
  const firstInputLine = rawData[0].trim();
  const charactersOfLine = firstInputLine.split('');
  const finalCharacter = charactersOfLine.pop();

  const outputCategory = determineDigitCategory(finalCharacter);
  logOutput(outputCategory);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
