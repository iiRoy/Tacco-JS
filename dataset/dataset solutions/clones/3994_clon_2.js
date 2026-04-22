"use strict";

const computeResult = (
  rawData
) => {
  rawData = rawData
    .trim()
    .split("\n");
  const limitVal = parseInt(rawData[0].split(" ")[0]);
  const constraintVal = parseInt(rawData[0].split(" ")[1]);

  let totalSum = 0;

  if (
    constraintVal === 0
  ) {
    console.log(limitVal * limitVal);
    return;
  }

  for (
    let currentDivisor = 1;
    currentDivisor <= limitVal;
    currentDivisor++
  ) {
    totalSum += Math.floor(limitVal / currentDivisor) * Math.max(
      0,
      currentDivisor - constraintVal
    );

    if (
      limitVal % currentDivisor > 0
    ) {
      totalSum += Math.max(
        0,
        (limitVal % currentDivisor) - constraintVal + 1
      );
    }
  }

  console.log(totalSum);
};

computeResult(
  require('fs')
  .readFileSync('/dev/stdin', 'utf8')
);