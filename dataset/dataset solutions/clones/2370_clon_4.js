"use strict";

const evaluateCondition = (incomingValue) => {
  let hundredsCounter = 0;
  let leftover = incomingValue;

  while (leftover >= 100) {
    leftover -= 100;
    hundredsCounter++;
  }

  const allowedMargin = hundredsCounter * 5;

  return (leftover <= allowedMargin) ? 1 : 0;
};

const processInputData = (rawDataString) => {
  const numericData = +rawDataString;
  console.log(evaluateCondition(numericData));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));