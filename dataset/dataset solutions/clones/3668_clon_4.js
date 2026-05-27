"use strict";

const processInput = rawData => {
    const lineSegments = rawData.trim().split('\n');
    const elementCount = Number.parseInt(lineSegments[0], 10);
    const hueSequence = lineSegments[1].split(' ');

    let alterationCount = 0;
    let scanIndex = 0;

    while (scanIndex < elementCount - 1) {
        if (hueSequence[scanIndex] === hueSequence[scanIndex + 1]) {
            alterationCount++;
            scanIndex += 2;
        } else {
            scanIndex++;
        }
    }
    console.log(alterationCount);
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
