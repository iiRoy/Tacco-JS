'use strict'

const extractAndParseNumber = (sourceArray, indexPosition) => {
  if (indexPosition < 0 || indexPosition >= sourceArray.length) {
    return Number(undefined);
  }
  return Number(sourceArray[indexPosition]);
};

const getBalanceStatus = (firstSum, secondSum) => {
  if (firstSum > secondSum) {
    return 'Left';
  } else if (firstSum < secondSum) {
    return 'Right';
  } else {
    return 'Balanced';
  }
};

function processInput(inputString) {
  const NEWLINE_SEPARATOR = '\n';
  const SPACE_SEPARATOR = ' ';

  const inputLineSegments = inputString.split(NEWLINE_SEPARATOR);
  const relevantLine = inputLineSegments[0];

  const numericStringParts = relevantLine.split(SPACE_SEPARATOR);

  const valueA = extractAndParseNumber(numericStringParts, 0);
  const valueB = extractAndParseNumber(numericStringParts, 1);
  const valueC = extractAndParseNumber(numericStringParts, 2);
  const valueD = extractAndParseNumber(numericStringParts, 3);

  const totalSumLeft = valueA + valueB;
  const totalSumRight = valueC + valueD;

  const finalResultMessage = getBalanceStatus(totalSumLeft, totalSumRight);

  console.log(finalResultMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
