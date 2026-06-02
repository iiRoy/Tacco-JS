'use strict';

const characterStream = require("fs").readFileSync("/dev/stdin", "utf8").split("");

const frequencyMap = characterStream.reduce((accumulator, currentSymbol) => {
  accumulator.set(currentSymbol, (accumulator.get(currentSymbol) || 0) + 1);
  return accumulator;
}, new Map());

const allCountsEven = Array.from(frequencyMap.values()).every(occurrenceCount => occurrenceCount % 2 === 0);

const finalOutcome = allCountsEven ? "Yes" : "No";

console.log(finalOutcome);
