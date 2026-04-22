'use strict';

function calculateDivisor(valA, valB) {
  while (valB !== 0) {
    let temp = valB;
    valB = valA % valB;
    valA = temp;
  }
  return valA;
}

function processInputData(rawText) {
  const [firstLineContent, secondLineContent] = rawText.split('\n');

  const referencePointMatcher = firstLineContent.match(/\d+\s+(\d+)/);
  const referencePoint = parseInt(referencePointMatcher[1], 10);

  const sourceNumberMatchers = secondLineContent.match(/-?\d+/g);
  const sourceNumbers = sourceNumberMatchers.map(valStr => parseInt(valStr, 10));

  const transformedValues = sourceNumbers.map(val => Math.abs(val - referencePoint));

  if (transformedValues.length === 1) {
    console.log(transformedValues[0]);
  } else {
    const finalDivisor = transformedValues.reduce((accumulator, currentVal) =>
      calculateDivisor(accumulator, currentVal)
    );
    console.log(finalDivisor);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());