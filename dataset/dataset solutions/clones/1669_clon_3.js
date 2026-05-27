"use strict";

const processInput = (rawData) => {
  const trimmedData = rawData.trim();

  const parseNumericString = (str) => {
    return parseInt(str, 10);
  };

  const parseNumberLine = (lineContent) => {
    return lineContent.split(' ').map(parseNumericString);
  };

  const dataLines = trimmedData.split('\n');
  const firstLineData = parseNumberLine(dataLines[0]);
  const numberSequence = parseNumberLine(dataLines[1]);

  let oddCount = 0;

  const INITIAL_INDEX = 1;
  const ITERATION_STEP = 2;
  const ODD_CHECK_DIVISOR = 2;

  const isValueOdd = (val) => {
    if (typeof val !== 'number' || isNaN(val)) {
      return false;
    }
    return val % ODD_CHECK_DIVISOR !== 0;
  };

  let currentIdx = INITIAL_INDEX;
  while (currentIdx <= numberSequence.length) {
    const currentNumber = numberSequence[currentIdx];

    if (isValueOdd(currentNumber)) {
      oddCount++;
    }
    currentIdx += ITERATION_STEP;
  }

  console.log(oddCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
