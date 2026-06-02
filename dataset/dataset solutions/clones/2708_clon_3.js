"use strict";

const solveProblem = (rawData) => {
    const processedInput = rawData.trim().split("\n");
    const inputChars = processedInput[0].split("");

    const modulusValue = 1000000007;

    const inputLength = inputChars.length;
    const numRemainders = 13;

    const dpTable = Array.from({ length: inputLength + 1 }, () => Array(numRemainders).fill(0));

    dpTable[0][0] = 1;

    for (let currentIdx = 0; currentIdx < inputLength; currentIdx++) {
        const charAtCurrentPos = inputChars[currentIdx];
        const digitConstraint = (charAtCurrentPos === "?") ? -1 : parseInt(charAtCurrentPos, 10);

        for (let possibleDigit = 0; possibleDigit < 10; possibleDigit++) {
            if (digitConstraint !== -1 && digitConstraint !== possibleDigit) {
                continue;
            }

            for (let prevRemainder = 0; prevRemainder < numRemainders; prevRemainder++) {
                const waysToReachPrevRemainder = dpTable[currentIdx][prevRemainder];

                if (waysToReachPrevRemainder === 0) {
                    continue;
                }

                const nextRemainder = (prevRemainder * 10 + possibleDigit) % numRemainders;

                dpTable[currentIdx + 1][nextRemainder] = (dpTable[currentIdx + 1][nextRemainder] + waysToReachPrevRemainder) % modulusValue;
            }
        }
    }

    console.log(dpTable[inputLength][5]);
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
