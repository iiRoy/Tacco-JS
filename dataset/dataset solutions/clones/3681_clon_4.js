"use strict";

const processInput = (rawContent) => {
    const inputLines = rawContent.trim().split("\n");
    const characterSequence = inputLines[0].split("");
    const extractionInterval = parseInt(inputLines[1], 10);

    const resultString = characterSequence.reduce((accumulator, currentCharacter, currentIndex) => {
        return currentIndex % extractionInterval === 0 ? accumulator + currentCharacter : accumulator;
    }, "");

    console.log(resultString);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
