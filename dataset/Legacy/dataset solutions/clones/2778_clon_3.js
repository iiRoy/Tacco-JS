"use strict";

const checkStringPattern = (inputStr) => {
    const charA = inputStr[0];
    const charB = inputStr[1];
    const charC = inputStr[2];
    const charD = inputStr[3];

    const isAABBPattern = (charA === charB && charC === charD && charA !== charC);
    if (isAABBPattern) {
        return true;
    }

    const isABABPattern = (charA === charC && charB === charD && charA !== charB);
    if (isABABPattern) {
        return true;
    }

    const isABBAPattern = (charA === charD && charB === charC && charA !== charB);
    if (isABBAPattern) {
        return true;
    }

    return false;
};

const processInputData = (dataLines) => {
    const targetString = dataLines[0];
    const patternMatchFound = checkStringPattern(targetString);
    console.log(patternMatchFound ? 'Yes' : 'No');
};

const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLineArray = rawInputContent.split('\n');
processInputData(inputLineArray);
