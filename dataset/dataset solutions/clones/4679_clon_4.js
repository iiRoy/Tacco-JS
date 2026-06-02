"use strict";

const calculateSegmentSeparation = (inputData) => {
    const [firstLineContent] = inputData.split("\n");
    const [segmentLength, positionA, positionB] = firstLineContent.split(" ").map(Number);

    const endPositionA = positionA + segmentLength;
    const endPositionB = positionB + segmentLength;

    const separationDistance = Math.max(0, Math.max(positionA, positionB) - Math.min(endPositionA, endPositionB));

    console.log(separationDistance);
};

calculateSegmentSeparation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
