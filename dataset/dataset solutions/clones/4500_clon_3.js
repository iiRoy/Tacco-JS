"use strict";

const processInputAndGenerateSequence = (rawData) => {
    let parsedLines = rawData.trim().split("\n");

    const sequenceLength = Number(parsedLines[0]);
    const sourceElements = parsedLines[1].split(" ").map(numStr => Number(numStr));

    let resultSequence = [];

    const isLengthEven = (sequenceLength % 2 === 0);

    const DECREMENT_STEP = 2;
    const INCREMENT_STEP = 2;

    if (isLengthEven) {
        let currentIdx = sequenceLength - 1;
        while (currentIdx > 0) {
            resultSequence.push(sourceElements[currentIdx]);
            currentIdx -= DECREMENT_STEP;
        }

        for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx += INCREMENT_STEP) {
            resultSequence.push(sourceElements[currentIdx]);
        }
    } else {
        let currentIdx = sequenceLength - 1;
        while (currentIdx >= 0) {
            resultSequence.push(sourceElements[currentIdx]);
            currentIdx -= DECREMENT_STEP;
        }

        for (let currentIdx = 1; currentIdx < sequenceLength; currentIdx += INCREMENT_STEP) {
            resultSequence.push(sourceElements[currentIdx]);
        }
    }

    const OUTPUT_SEPARATOR = " ";
    console.log(resultSequence.join(OUTPUT_SEPARATOR));
};

processInputAndGenerateSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
