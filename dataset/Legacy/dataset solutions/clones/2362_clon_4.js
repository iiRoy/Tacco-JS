"use strict";

function processInputData(rawData) {
  const extractedNumericValues = rawData.split('\n').slice(0, 2).reduce((accumulator, currentLineSegment) => {
    accumulator.push(Number(currentLineSegment.split(' ')[0]));
    return accumulator;
  }, []);

  const firstValue = extractedNumericValues[0];
  const secondValue = extractedNumericValues[1];

  // Core logic: !(firstValue === secondValue)
  // Equivalent to: firstValue !== secondValue
  // Using a different expression: Boolean(firstValue - secondValue)
  // If firstValue and secondValue are equal, their difference is 0, Boolean(0) is false.
  // If firstValue and secondValue are not equal, their difference is a non-zero number, Boolean(non-zero) is true.
  const finalComparisonOutcome = Boolean(firstValue - secondValue);

  console.log(finalComparisonOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
