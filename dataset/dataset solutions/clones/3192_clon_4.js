"use strict";

const sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8");

const parsedLines = sourceData.split("\n");

const elementCount = Number.parseInt(parsedLines[0], 10);

const numericalCollection = parsedLines[1].split(" ").map(Number.parseInt);

function determineGreatestCommonDivisor(valueA, valueB) {
  if (valueB === 0) {
    return valueA;
  }
  return determineGreatestCommonDivisor(valueB, valueA % valueB);
}

const ultimateCommonDivisor = numericalCollection.reduce(determineGreatestCommonDivisor);

console.log(ultimateCommonDivisor);