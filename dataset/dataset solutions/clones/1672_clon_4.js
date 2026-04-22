"use strict"
const sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8");

const lineFragments = sourceData.split("\n");
const numericSequence = lineFragments[1].split(" ").map(Number);

const filteredValues = numericSequence.filter((elementValue, elementIndex) => {
  const isPositionEven = (elementIndex % 2 === 0);
  const isValueOdd = (elementValue % 2 !== 0);
  
  return isPositionEven && isValueOdd;
});

const finalResult = filteredValues.length;

console.log(finalResult);