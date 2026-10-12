'use strict';

function processInputData(rawData) {
  const trimmedInputString = rawData.trim();
  const splitInputParts = trimmedInputString.split(' ');

  const firstNumericValue = +splitInputParts[0];
  const secondNumericValue = +splitInputParts[1];

  const doubledSecondValue = secondNumericValue * 2;
  const intermediateDivisionResult = firstNumericValue / doubledSecondValue;
  const finalCeilingResult = Math.ceil(intermediateDivisionResult);
  
  console.log(finalCeilingResult);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileContents);
