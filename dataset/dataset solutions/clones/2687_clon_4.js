"use strict";

const determineRBlockStart = (sequence, currentPosition) => {
    let searchPosition = currentPosition;
    while (searchPosition >= 0 && sequence[searchPosition] === 'R') {
        searchPosition--;
    }
    return searchPosition + 1;
};

const determineLBlockEnd = (sequence, currentPosition) => {
    let searchPosition = currentPosition;
    while (searchPosition < sequence.length && sequence[searchPosition] === 'L') {
        searchPosition++;
    }
    return searchPosition - 1;
};

const processSequence = (inputData) => {
    const inputLines = inputData.trim().split("\n");
    const characterArray = inputLines[0].split("");
    const arrayLength = characterArray.length;

    const finalDistribution = Array(arrayLength).fill(0);

    const transitionPoints = [];
    for (let currentIdx = 0; currentIdx < arrayLength - 1; currentIdx++) {
        if (characterArray[currentIdx] === 'R' && characterArray[currentIdx + 1] === 'L') {
            transitionPoints.push(currentIdx);
        }
    }

    for (const rightmostRIndex of transitionPoints) {
        const leftmostLIndex = rightmostRIndex + 1;

        const rSegmentStart = determineRBlockStart(characterArray, rightmostRIndex);
        const lSegmentEnd = determineLBlockEnd(characterArray, leftmostLIndex);

        let rToRightmostR_sameParity = 0;
        let rToRightmostR_diffParity = 0;
        let lToLeftmostL_sameParity = 0;
        let lToLeftmostL_diffParity = 0;

        for (let rChildOrigin = rSegmentStart; rChildOrigin <= rightmostRIndex; rChildOrigin++) {
            if (rChildOrigin % 2 === rightmostRIndex % 2) {
                rToRightmostR_sameParity++;
            } else {
                rToRightmostR_diffParity++;
            }
        }

        for (let lChildOrigin = leftmostLIndex; lChildOrigin <= lSegmentEnd; lChildOrigin++) {
            if (lChildOrigin % 2 === leftmostLIndex % 2) {
                lToLeftmostL_sameParity++;
            } else {
                lToLeftmostL_diffParity++;
            }
        }

        finalDistribution[rightmostRIndex] += rToRightmostR_sameParity + lToLeftmostL_diffParity;
        finalDistribution[leftmostLIndex] += rToRightmostR_diffParity + lToLeftmostL_sameParity;
    }

    console.log(finalDistribution.join(" "));
};

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
