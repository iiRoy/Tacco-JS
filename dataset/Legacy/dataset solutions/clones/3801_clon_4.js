"use strict";

const processInput = (inputData) => {
    const lines = inputData.trim().split("\n");
    const sequenceLength = parseInt(lines[0].split(" ")[0]);
    const charSequence = lines[1].split("");

    const westPrefixCounts = new Array(sequenceLength + 1).fill(0);
    const eastPrefixCounts = new Array(sequenceLength + 1).fill(0);

    for (let k = 0; k < sequenceLength; k++) {
        westPrefixCounts[k + 1] = westPrefixCounts[k] + (charSequence[k] === 'W' ? 1 : 0);
        eastPrefixCounts[k + 1] = eastPrefixCounts[k] + (charSequence[k] === 'E' ? 1 : 0);
    }

    const totalEast = eastPrefixCounts[sequenceLength];
    let minResult = Infinity;

    for (let idx = 0; idx < sequenceLength; idx++) {
        const currentWestLeft = westPrefixCounts[idx];
        let currentEastRight = totalEast - eastPrefixCounts[idx];

        if (charSequence[idx] === "E") {
            currentEastRight--;
        }

        minResult = Math.min(minResult, currentWestLeft + currentEastRight);
    }

    console.log(minResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
