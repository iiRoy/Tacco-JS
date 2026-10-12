"use strict";

const processInput = function (rawData) {
  const targetCharacter = '1';
  const characterSequence = rawData.split("");

  const countOfTarget = characterSequence.reduce((currentCount, currentElement) => {
    if (currentElement === targetCharacter) {
      return currentCount + 1;
    }
    return currentCount;
  }, 0);

  const resultValue = countOfTarget;
  console.log(resultValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
