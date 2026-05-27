"use strict";

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));

function processInputData(rawInputText) {
  const inputLines = rawInputText.split("\n");

  const segmentCountHint = parseInt(inputLines.shift(), 10);

  const segmentMeasures = inputLines[0].split(" ").map(val => parseInt(val, 10));

  const overallTotal = segmentMeasures.reduce((accumulator, currentMeasure) => accumulator + currentMeasure, 0);

  let runningSum = 0;
  const cumulativeSums = segmentMeasures.map(measure => {
    runningSum += measure;
    return runningSum;
  });

  const partitionPointIndex = cumulativeSums.findIndex(currentCumulativeSum => {
    return 2 * currentCumulativeSum >= overallTotal;
  });

  const leftPartitionSum = cumulativeSums[partitionPointIndex];

  const rightPartitionSum = overallTotal - leftPartitionSum;

  console.log(Math.abs(leftPartitionSum - rightPartitionSum));
}
