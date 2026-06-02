"use strict";

const getCharCount = (characterArray, charToFind) => {
    let currentCount = 0;
    for (const singleChar of characterArray) {
        if (singleChar === charToFind) {
            currentCount++;
        }
    }
    return currentCount;
};

const processInputContent = (fullInputString) => {
    const cleanedInput = fullInputString.trim();
    const inputLines = cleanedInput.split("\n");

    const firstRelevantLine = inputLines[0];
    const charactersOfFirstLine = firstRelevantLine.split("");

    const searchTarget = "1";
    const finalCount = getCharCount(charactersOfFirstLine, searchTarget);

    console.log(finalCount);
};

const fileSystemUtility = require('fs');
const standardInputPath = '/dev/stdin';
const fileEncoding = 'utf8';

const rawFileContent = fileSystemUtility.readFileSync(standardInputPath, fileEncoding);
processInputContent(rawFileContent);
