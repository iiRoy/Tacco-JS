'use strict';

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");

const charFrequencies = inputSource.split('').reduce((accumulator, currentCharacter) => {
    accumulator.set(currentCharacter, (accumulator.get(currentCharacter) || 0) + 1);
    return accumulator;
}, new Map());

const areAllCountsEven = Array.from(charFrequencies.values()).every(tally => tally % 2 === 0);

console.log(areAllCountsEven ? "Yes" : "No");