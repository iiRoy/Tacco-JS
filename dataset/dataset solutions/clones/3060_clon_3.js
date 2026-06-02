"use strict";

const processInput = (inputString) => {
    const lines = inputString.trim().split("\n");
    const nkParts = lines[0].split(" ");

    const totalLength = Number(nkParts[0]);
    const maxFlips = Number(nkParts[1]);

    const sequenceArray = lines[1].split("").map(char => Number(char));

    let blockLengths = [];

    const hasZero = sequenceArray.includes(0);
    const hasOne = sequenceArray.includes(1);

    if (!hasZero || !hasOne) {
        console.log(totalLength);
        return;
    }

    if (sequenceArray[0] !== 1) {
        blockLengths.push(0);
    }

    sequenceArray.push(0);

    let currentStreak = 0;
    const finalSequenceLength = sequenceArray.length;

    for (let k = 1; k <= finalSequenceLength; k++) {
        if (sequenceArray[k] === sequenceArray[k - 1]) {
            currentStreak++;
        } else {
            currentStreak++;
            blockLengths.push(currentStreak);
            currentStreak = 0;
        }
    }

    let currentWindowSum = 0;
    let maxAchievableLength = 0;

    const effectiveWindowBlockCount = maxFlips * 2 + 1;

    for (let blockIndex = 0; blockIndex < blockLengths.length; blockIndex++) {
        currentWindowSum += blockLengths[blockIndex];

        if ((blockIndex + 1) % effectiveWindowBlockCount === 0) {
            maxAchievableLength = Math.max(maxAchievableLength, currentWindowSum);
            currentWindowSum = 0;
        }
    }

    maxAchievableLength = Math.max(maxAchievableLength, currentWindowSum);

    console.log(maxAchievableLength);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
