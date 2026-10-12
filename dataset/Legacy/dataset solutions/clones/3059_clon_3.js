"use strict";
function processInputData(rawInputString) {
    let inputLinesArray = rawInputString.split("\n");

    let paramLine = inputLinesArray.shift();
    let parsedParameters = paramLine.split(/\s/).map(val => parseInt(val, 10));

    let sequenceLength = parsedParameters[0];
    let flipLimit = parsedParameters[1];

    let sequenceString = inputLinesArray.shift().split(/\s/)[0];
    let binaryDigitSequence = sequenceString.split("").map(char => parseInt(char, 10));

    let currentPosition = 0;
    let segmentDetails = [];
    let currentSegmentType = binaryDigitSequence[0];

    while (currentPosition < sequenceLength) {
        let segmentStart = currentPosition;
        let segmentScanPointer = currentPosition;

        while (segmentScanPointer < sequenceLength && binaryDigitSequence[segmentScanPointer] === currentSegmentType) {
            segmentScanPointer++;
        }

        // This condition replicates the original behavior where the last segment
        // is only added if it's followed by a segment of a different type.
        // If the segment extends to the end of the sequence, it is not added.
        if (segmentScanPointer < sequenceLength) {
            let segmentBlockLength = segmentScanPointer - segmentStart;
            segmentDetails.push({ kind: currentSegmentType, pos: segmentStart, len: segmentBlockLength });
            currentSegmentType = (currentSegmentType + 1) % 2;
        }
        currentPosition = segmentScanPointer;
    }

    if (segmentDetails[0].kind === 0) {
        segmentDetails.unshift({ kind: 1, pos: 0, len: 0 });
    }

    // The variable 'zeroSegmentCounter' (original 'zs') was calculated but never used.
    // It is removed as a non-essential/redundant piece of code.

    // The function 'calculateSegmentSum' (original 'f') was defined but never called.
    // It is removed as a non-essential/redundant piece of code.

    let cumulativeLength = 0;
    const loopUpperLimit = flipLimit * 2; // Helper variable for loop bound

    for (let i = 0; i <= loopUpperLimit; i++) {
        cumulativeLength += segmentDetails[i].len;
    }

    console.log(cumulativeLength);
}

if (typeof window === "undefined") {
    processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
