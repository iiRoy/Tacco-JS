'use strict';

function processInputData(rawContent) {
  const firstLineSegment = rawContent.split('\n')[0];

  const spaceDelimiterIndex = firstLineSegment.indexOf(' ');
  const firstNumericalOperand = Number(firstLineSegment.substring(0, spaceDelimiterIndex));
  const secondNumericalOperand = Number(firstLineSegment.substring(spaceDelimiterIndex + 1));

  const cumulativeSum = firstNumericalOperand + secondNumericalOperand;
  const finalModuloResult = cumulativeSum - Math.floor(cumulativeSum / 24) * 24;

  console.log(finalModuloResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
