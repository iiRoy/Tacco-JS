"use strict";

const checkMonthValidity = (value) => {
  const MIN_MONTH_VALUE = 1;
  const MAX_MONTH_VALUE = 12;
  return value >= MIN_MONTH_VALUE && value <= MAX_MONTH_VALUE;
};

function processDateString(rawInputString) {
  const firstSegmentString = rawInputString.substring(0, 2);
  const secondSegmentString = rawInputString.substring(2, 4);

  const firstNumericPart = parseInt(firstSegmentString, 10);
  const secondNumericPart = parseInt(secondSegmentString, 10);

  const isFirstPartMonth = checkMonthValidity(firstNumericPart);
  const isSecondPartMonth = checkMonthValidity(secondNumericPart);

  let outputMessage;

  if (isFirstPartMonth && isSecondPartMonth) {
    outputMessage = 'AMBIGUOUS';
  } else if (isFirstPartMonth) {
    outputMessage = 'MMYY';
  } else if (isSecondPartMonth) {
    outputMessage = 'YYMM';
  } else {
    outputMessage = 'NA';
  }

  console.log(outputMessage);
}

processDateString(require("fs").readFileSync("/dev/stdin", "utf8"));
