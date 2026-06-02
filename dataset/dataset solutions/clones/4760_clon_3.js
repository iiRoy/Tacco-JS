'use strict';

function processSequence(rawData) {
  const charArray = rawData.split('');

  const sequenceLength = parseInt(charArray[0], 10);

  let currentValue = 0;

  const resultValues = [];

  const INCREMENT_OPERATION_CHAR = 'I';
  const STEP_AMOUNT = 1;

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const operationChar = charArray[currentIndex + 1];

    if (operationChar === INCREMENT_OPERATION_CHAR) {
      currentValue += STEP_AMOUNT;
    } else {
      currentValue -= STEP_AMOUNT;
    }

    resultValues.push(currentValue);
  }

  console.log(Math.max(...resultValues));
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
