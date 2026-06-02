"use strict";

const main = (inputData) => {
    const processedInput = inputData.trim().split("\n");
    const charSequence = processedInput[0].split("");

    const modulusConstant = 1000000007;

    const initialRemainderCounts = Array(13).fill(0);
    initialRemainderCounts[0] = 1;

    const finalRemainderCounts = charSequence.reduce((currentCounts, currentCharacter) => {
        const nextIterationCounts = Array(13).fill(0);
        const digitValue = currentCharacter === '?' ? -1 : parseInt(currentCharacter);

        for (let priorRemainder = 0; priorRemainder < 13; priorRemainder++) {
            if (currentCounts[priorRemainder] === 0) {
                continue;
            }
            for (let candidateDigit = 0; candidateDigit < 10; candidateDigit++) {
                if (digitValue !== -1 && digitValue !== candidateDigit) {
                    continue;
                }
                const newModuloResult = (priorRemainder * 10 + candidateDigit) % 13;
                nextIterationCounts[newModuloResult] = (nextIterationCounts[newModuloResult] + currentCounts[priorRemainder]) % modulusConstant;
            }
        }
        return nextIterationCounts;
    }, initialRemainderCounts);

    console.log(finalRemainderCounts[5]);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
