"use strict";

function calculateValue(valA, valB) {
  const combinedString = valA + valB;
  const numericResult = combinedString / 2;
  return numericResult;
}

function processInput(rawData) {
  const parts = rawData.split(" ");
  const finalComputedValue = calculateValue(parts[0], parts[1]);
  console.log(finalComputedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
