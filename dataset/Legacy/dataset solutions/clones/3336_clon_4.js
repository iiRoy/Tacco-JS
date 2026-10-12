'use strict'

function calculateGameOutcome(elementCount, numberSequence) {
    const scoreCache = Array.from({ length: elementCount }, () =>
        Array(elementCount).fill(null)
    );

    const computeOptimalScore = (leftIdx, rightIdx) => {
        if (leftIdx > rightIdx) {
            return 0;
        }

        if (scoreCache[leftIdx][rightIdx] !== null) {
            return scoreCache[leftIdx][rightIdx];
        }

        let currentOptimalScore;

        if (leftIdx === rightIdx) {
            currentOptimalScore = numberSequence[leftIdx];
        } else if (leftIdx + 1 === rightIdx) {
            currentOptimalScore = Math.max(numberSequence[leftIdx], numberSequence[rightIdx]);
        } else {
            const scoreIfLeftTaken = numberSequence[leftIdx] + Math.min(
                computeOptimalScore(leftIdx + 2, rightIdx),
                computeOptimalScore(leftIdx + 1, rightIdx - 1)
            );

            const scoreIfRightTaken = numberSequence[rightIdx] + Math.min(
                computeOptimalScore(leftIdx + 1, rightIdx - 1),
                computeOptimalScore(leftIdx, rightIdx - 2)
            );

            currentOptimalScore = Math.max(scoreIfLeftTaken, scoreIfRightTaken);
        }

        scoreCache[leftIdx][rightIdx] = currentOptimalScore;
        return currentOptimalScore;
    };

    const playerOneFinalScore = computeOptimalScore(0, elementCount - 1);
    const totalSequenceValue = numberSequence.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
    const playerTwoFinalScore = totalSequenceValue - playerOneFinalScore;

    return playerOneFinalScore - playerTwoFinalScore;
}

function processInputAndDisplay(rawInput) {
    const inputLines = rawInput.split("\n");
    const parsedCount = Number(inputLines[0]);
    const numericSequence = inputLines[1].split(' ').map(val => Number(val));

    const finalResult = calculateGameOutcome(parsedCount, numericSequence);
    console.log(finalResult);
}

processInputAndDisplay(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
