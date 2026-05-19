"use strict";

function calculateValue(inputVal) {
  if (inputVal === 1) {
    return 1;
  }
  return calculateValue(inputVal / 2) * 2 + 1;
}

function ProcessInput(rawData) {
  let cleanedInput = rawData.trim();
  let heightValue = Number(cleanedInput);
  let finalResult = calculateValue(heightValue);
  console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
