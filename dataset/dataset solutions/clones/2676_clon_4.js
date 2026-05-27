'use strict';

const calculateExcessValue = (inputContent) => {
  const dataLines = inputContent.split('\n');
  const primaryLine = dataLines[0];

  const numericalComponents = primaryLine
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  const referenceValue = numericalComponents[0];
  const componentOne = numericalComponents[1];
  const componentTwo = numericalComponents[2];

  const sumOfComponents = componentOne + componentTwo;
  const difference = sumOfComponents - referenceValue;

  return Math.max(0, difference);
};

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalResult = calculateExcessValue(fileData);
console.log(finalResult);
