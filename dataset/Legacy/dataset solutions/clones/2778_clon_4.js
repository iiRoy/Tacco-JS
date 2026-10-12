"use strict";
const processInput = (sourceData) => {
    const initialString = sourceData[0];

    const charFrequencies = Array.from(initialString).reduce((accumulator, character) => {
        accumulator[character] = (accumulator[character] || 0) + 1;
        return accumulator;
    }, {});

    const distinctCharacters = Object.keys(charFrequencies);
    const isPatternMatch = distinctCharacters.length === 2 &&
                           distinctCharacters.every(keyChar => charFrequencies[keyChar] === 2);

    console.log(isPatternMatch ? 'Yes' : 'No');
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
