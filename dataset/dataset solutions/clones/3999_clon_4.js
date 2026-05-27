"use strict";

const devMode = false;
const sourceData = devMode
  ? "30000 30000 30000"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const evaluateCondition = inputPayload => {
  const parsedSegments = inputPayload.split(" ");
  const limitVal = +parsedSegments[0];
  const firstCount = +parsedSegments[1];
  const secondCount = +parsedSegments[2];

  const totalRequired = firstCount + secondCount;
  const isWithinBounds = (totalRequired <= limitVal);

  // Map boolean result to output using array indexing
  // Number(false) is 0, Number(true) is 1
  // If isWithinBounds is false (totalRequired > limitVal), index 0 -> ""
  // If isWithinBounds is true (totalRequired <= limitVal), index 1 -> -1
  const resultOptions = ["", -1];
  console.log(resultOptions[Number(isWithinBounds)]);
};

evaluateCondition(sourceData);
