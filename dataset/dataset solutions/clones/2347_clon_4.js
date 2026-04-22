"use strict";

function processStream(initialData) {
    const characterSequence = Array.from(initialData);
    const sequenceLength = characterSequence.length;
    
    const divergenceCount = Array.from({ length: Math.floor(sequenceLength / 2) })
        .reduce((currentTally, _, position) => {
            const leftChar = characterSequence[position];
            const rightChar = characterSequence[sequenceLength - 1 - position];
            return currentTally + (leftChar !== rightChar ? 1 : 0);
        }, 0);

    console.log(divergenceCount);
}

processStream(require("node:fs").readFileSync("/dev/stdin", "utf8"));