"use strict";

const processInput = (rawInput) => {
    const dataLines = rawInput.trim().split("\n");
    const elementCount = parseInt(dataLines[0], 10);
    const sourceValues = dataLines[1].split(" ").map(Number);

    const evenPositioned = sourceValues.filter((_, index) => index % 2 === 0);
    const oddPositioned = sourceValues.filter((_, index) => index % 2 !== 0);

    let resultSequence;

    if (elementCount % 2 === 0) {
        // For even N: odd-indexed elements (reversed) followed by even-indexed elements (original order)
        resultSequence = oddPositioned.reverse().concat(evenPositioned);
    } else {
        // For odd N: even-indexed elements (reversed) followed by odd-indexed elements (original order)
        resultSequence = evenPositioned.reverse().concat(oddPositioned);
    }

    console.log(resultSequence.join(" "));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
