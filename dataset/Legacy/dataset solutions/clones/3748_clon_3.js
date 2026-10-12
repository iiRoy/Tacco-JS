'use strict'

const extractAndConvertNumericPart = (sourceSegments, segmentIndex) => {
  return Number(sourceSegments[segmentIndex]);
};

const checkValueAgainstThreshold = (currentValue, limitThreshold) => {
  return currentValue <= limitThreshold;
};

function processInputData(rawInputString) {
  const dataSegments = rawInputString.split(' ');

  const firstNumericValue = extractAndConvertNumericPart(dataSegments, 0);
  const secondNumericValue = extractAndConvertNumericPart(dataSegments, 1);

  const MAXIMUM_ACCEPTABLE_VALUE = 8;

  const isFirstValueAcceptable = checkValueAgainstThreshold(firstNumericValue, MAXIMUM_ACCEPTABLE_VALUE);
  const isSecondValueAcceptable = checkValueAgainstThreshold(secondNumericValue, MAXIMUM_ACCEPTABLE_VALUE);

  if (isFirstValueAcceptable && isSecondValueAcceptable) {
    console.log('Yay!');
  } else {
    console.log(':(');
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
