"use strict";

const countBits = (valueToExamine) => {
    let setBitCount = 0;
    let temporaryValue = valueToExamine;
    while (temporaryValue > 0) {
        temporaryValue &= (temporaryValue - 1);
        setBitCount++;
    }
    return setBitCount;
};

function processInputData(rawData) {
    let parsedLines = rawData.trim().split("\n");
    const testCaseCount = Number(parsedLines.shift());

    for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
        const vertexCount = parsedLines[0 + caseIndex * 3];
        const vertexValues = parsedLines[1 + caseIndex * 3].split(" ").map(val => Number(val));
        const operationSequence = parsedLines[2 + caseIndex * 3];

        let currentXorState = 0;

        currentXorState = Array.from(operationSequence).reduce((accumulatorState, charIndicator, sequenceIndex) => {
            const currentAElement = vertexValues[sequenceIndex];
            const potentialXorResult = accumulatorState ^ currentAElement;

            const currentBitOnes = countBits(accumulatorState);
            const potentialBitOnes = countBits(potentialXorResult);

            console.log(`S${charIndicator} will do..`);
            console.log(`  1 count for new = ${potentialBitOnes}, or ${potentialXorResult}`);
            console.log(`  1 count for old = ${currentBitOnes}, or ${accumulatorState}`);

            const shouldApplyXor = (charIndicator === '1') === (potentialBitOnes > currentBitOnes);

            return shouldApplyXor ? potentialXorResult : accumulatorState;
        }, 0);

        console.log(`${currentXorState ? "1" : "0"}`);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
