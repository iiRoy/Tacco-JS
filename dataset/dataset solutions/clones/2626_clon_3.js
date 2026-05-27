"use strict";
const processInputData = (rawInputString) => {
  const THRESHOLD_CONSTANT = 3200;
  const colorSwapLogic = new Map([
    ["pink", "red"],
    ["red", "pink"]
  ]);

  const inputLines = rawInputString.trim().split("\n");
  const thresholdValueStr = inputLines[0];
  const colorString = inputLines[1];

  const parsedThreshold = Number(thresholdValueStr);

  let computedResult;

  if (parsedThreshold >= THRESHOLD_CONSTANT) {
    computedResult = colorString;
  } else {
    computedResult = colorSwapLogic.get(colorString) || colorString;
  }
  console.log(computedResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
