"use strict";

const processInput = (rawData) => {
  rawData = rawData.trim().split("\n");

  const numItems = parseInt(rawData[0]);
  const valueList = rawData[1].split(" ").map(itemVal => parseInt(itemVal));

  const overallTotal = valueList.reduce((runningSum, nextNum) => runningSum + nextNum);

  let segmentSumA = valueList[0];
  let segmentSumB = overallTotal - valueList[0];

  let minDifference = Infinity;

  for (let indexPos in valueList) {
    let absoluteDiff = Math.abs(segmentSumB - segmentSumA);
    minDifference = Math.min(minDifference, absoluteDiff);

    segmentSumB -= valueList[indexPos];
    segmentSumA += valueList[indexPos];
  }

  console.log(minDifference);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));