"use strict";
const fileSystem = require("fs");

const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

const inputLines = rawInputData.split("\n");
const elementCountLimit = Number(inputLines[0]);
const numericalSequence = inputLines[1].split(" ").map(Number);

const matchingElementsCount = numericalSequence
  .slice(0, elementCountLimit)
  .filter((currentValue, currentIndex) => {
    return currentIndex % 2 === 0 && currentValue % 2 === 1;
  }).length;

console.log(matchingElementsCount);
