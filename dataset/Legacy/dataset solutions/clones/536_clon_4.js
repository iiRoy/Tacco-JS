"use strict";

function calculateMeanFromInput(dataSource) {
  const numericalComponents = dataSource.split(" ").map(val => Number(val));

  const aggregatedSum = numericalComponents.reduce((currentTotal, itemValue) => currentTotal + itemValue, 0);

  const resultantMean = aggregatedSum / numericalComponents.length;

  console.log(resultantMean);
}

calculateMeanFromInput(require("fs").readFileSync("/dev/stdin", "utf8"));
