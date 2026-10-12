"use strict";

const extractIntervalChars = (sourceChars, stepSize) => {
    let collectedChars = [];
    for (let currentIdx = 0; currentIdx < sourceChars.length; currentIdx++) {
        if (currentIdx % stepSize === 0) {
            const charToAdd = sourceChars[currentIdx];
            collectedChars.push(charToAdd);
        }
    }
    return collectedChars;
};

const processInput = (inputData) => {
    const trimmedInput = inputData.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineContent = inputLines[0];
    const charArray = firstLineContent.split("");

    const intervalWidth = parseInt(inputLines[1]);
    
    const resultChars = extractIntervalChars(charArray, intervalWidth);
    
    console.log(resultChars.join(""));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
