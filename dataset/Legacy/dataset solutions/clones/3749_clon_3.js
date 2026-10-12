"use strict";

const generateZeroString = (countValue) => {
    if (countValue < 0) {
        return "";
    }
    return "0".repeat(countValue);
};

const executeMainLogic = (inputContent) => {
    const processedLines = inputContent.trim().split("\n");
    const firstLineSegments = processedLines[0].split(" ");

    const categoryIdentifier = parseInt(firstLineSegments[0], 10);
    const numericValue = parseInt(firstLineSegments[1], 10);

    const requiredZeroCount = categoryIdentifier * 2;

    const zeroSuffixString = generateZeroString(requiredZeroCount);

    const finalOutputString = String(numericValue) + zeroSuffixString;
    
    console.log(finalOutputString);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
