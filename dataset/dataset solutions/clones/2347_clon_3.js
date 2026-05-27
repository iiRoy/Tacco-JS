"use strict";

function processInputData(rawInputString) {
    const characterSequence = rawInputString.split("");
    let mismatchCount = 0;

    const totalLength = characterSequence.length;
    const loopIterations = Math.ceil(totalLength / 2);

    let currentIdx = 0;
    while (currentIdx < loopIterations) {
        const frontCharacter = characterSequence[currentIdx];
        const correspondingEndIndex = totalLength - 1 - currentIdx;
        const backCharacter = characterSequence[correspondingEndIndex];

        if (frontCharacter !== backCharacter) {
            mismatchCount++;
        }
        currentIdx++;
    }
    console.log(mismatchCount);
}

const retrieveStandardInput = () => {
    const fileSystemModule = require("fs");
    const inputFilePath = "/dev/stdin";
    const encodingFormat = "utf8";
    return fileSystemModule.readFileSync(inputFilePath, encodingFormat);
};

processInputData(retrieveStandardInput());
