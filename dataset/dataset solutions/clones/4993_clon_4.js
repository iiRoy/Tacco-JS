'use strict';

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");

const characterTally = rawInput.split('').reduce((accumulatorMap, currentSymbol) => {
    accumulatorMap.set(currentSymbol, (accumulatorMap.get(currentSymbol) || 0) + 1);
    return accumulatorMap;
}, new Map());

const allCountsEven = Array.from(characterTally.values()).every(tally => tally % 2 === 0);

const finalAnswer = allCountsEven ? "Yes" : "No";

console.log(finalAnswer);