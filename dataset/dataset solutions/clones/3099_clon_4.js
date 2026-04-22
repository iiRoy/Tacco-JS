"use strict";

function calculateLongestNucleotideSequence(sourceData) {
    const primaryLine = sourceData.split("\n")[0];
    const nucleotideRegex = /[ACGT]+/g;
    const foundSequences = primaryLine.match(nucleotideRegex);

    if (!foundSequences || foundSequences.length === 0) {
        return 0;
    }

    const maxSequenceLength = foundSequences.reduce((currentMax, sequenceElement) => {
        return Math.max(currentMax, sequenceElement.length);
    }, 0);

    return maxSequenceLength;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalValue = calculateLongestNucleotideSequence(fileContent);
console.log(finalValue);