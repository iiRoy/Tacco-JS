"use strict";

const obtainTargetCharacter = (fullInputContent) => {
    const inputLines = fullInputContent.split("\n");
    const primaryLine = inputLines[0];
    const lineParts = primaryLine.split(" ");
    const targetSegment = lineParts[1];
    const firstCharacter = targetSegment.charAt(0);
    return firstCharacter;
};

const processInput = inputData => {
    const extractedChar = obtainTargetCharacter(inputData);
    const prefixString = "A";
    const suffixString = "C";
    const finalOutputString = prefixString + extractedChar + suffixString;

    console.log(finalOutputString);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
