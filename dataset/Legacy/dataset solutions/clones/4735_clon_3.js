"use strict";

const calculateNextSegmentLength = (isActiveStatus, currentLengthValue) => {
    if (isActiveStatus) {
        return currentLengthValue + 1;
    }
    return currentLengthValue;
};

const processInput = inputData => {
    const inputLines = inputData.split("\n");
    const characterSequence = inputLines[0].split("");

    let segmentActive = false;
    let recordedSegmentLengths = [];
    let currentSegmentAccumulator = 0;

    for (let charIdx = 0; charIdx < characterSequence.length; charIdx++) {
        const currentCharacter = characterSequence[charIdx];

        if (currentCharacter === "A") {
            segmentActive = true;
        }

        if (currentCharacter === "Z") {
            segmentActive = false;
            recordedSegmentLengths.push(currentSegmentAccumulator);
        }

        currentSegmentAccumulator = calculateNextSegmentLength(segmentActive, currentSegmentAccumulator);
    }

    let maxObservedLength = -Infinity;
    if (recordedSegmentLengths.length > 0) {
        maxObservedLength = Math.max(...recordedSegmentLengths);
    }

    console.log(maxObservedLength + 1);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
