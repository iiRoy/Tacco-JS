'use strict';

const inputCharacters = require("fs").readFileSync("/dev/stdin", "utf8").split("");

const characterFrequencyMap = inputCharacters.reduce((frequencyAccumulator, currentCharacter) => {
    frequencyAccumulator.set(currentCharacter, (frequencyAccumulator.get(currentCharacter) || 0) + 1);
    return frequencyAccumulator;
}, new Map());

const finalOutcome = Array.from(characterFrequencyMap.values()).every(countValue => countValue % 2 === 0) ? "Yes" : "No";

console.log(finalOutcome);
