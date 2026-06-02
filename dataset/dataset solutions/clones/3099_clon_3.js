"use strict";

const isNucleotideBase = (charToCheck) => {
    const validBasesSet = new Set(['A', 'C', 'T', 'G']);
    return validBasesSet.has(charToCheck);
};

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstLineContent = inputLines[0];
    const lineTokens = firstLineContent.split(/\s/);
    const primarySequenceFragment = lineTokens[0];

    const processedSequenceWithSentinel = primarySequenceFragment + 'X';

    let longestConsecutiveSegment = 0;
    let currentSegmentLength = 0;

    for (let charIndex = 0; charIndex < processedSequenceWithSentinel.length; charIndex++) {
        const currentCharacter = processedSequenceWithSentinel.charAt(charIndex);

        if (isNucleotideBase(currentCharacter)) {
            currentSegmentLength++;
        } else {
            longestConsecutiveSegment = Math.max(longestConsecutiveSegment, currentSegmentLength);
            currentSegmentLength = 0;
        }
    }

    console.log(longestConsecutiveSegment);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
