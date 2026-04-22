'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let accumulatedData = '';
let linePointer = 0;

process.stdin.on('data', incomingChunk => {
    accumulatedData += incomingChunk;
});

process.stdin.on('end', () => {
    accumulatedData = accumulatedData.split('\n');
    initiateProcessing();
});

function retrieveNextDatum() {
    return accumulatedData[linePointer++];
}

const calculateMaxScore = (limit, costs, rewards) => {
    const memoizationCache = new Map();

    const deriveScore = (currentGoal) => {
        if (currentGoal < 0) {
            return -Infinity; // Indicate an invalid state or path
        }
        if (currentGoal === 0) {
            return 0;
        }
        if (memoizationCache.has(currentGoal)) {
            return memoizationCache.get(currentGoal);
        }

        let bestScoreForGoal = currentGoal; // Base value if no operations applied

        for (let i = 0; i < 3; i++) {
            const expenditure = costs[i];
            const gain = rewards[i];

            if (currentGoal >= expenditure) {
                const candidateScore = deriveScore(currentGoal - expenditure) + gain;
                if (candidateScore > bestScoreForGoal) {
                    bestScoreForGoal = candidateScore;
                }
            }
        }

        memoizationCache.set(currentGoal, bestScoreForGoal);
        return bestScoreForGoal;
    };

    return deriveScore(limit);
};


function initiateProcessing() {
    const initialTarget = parseInt(retrieveNextDatum(), 10);
    const firstOptionSet = retrieveNextDatum().split(' ').map(numStr => parseInt(numStr, 10));
    const secondOptionSet = retrieveNextDatum().split(' ').map(numStr => parseInt(numStr, 10));

    const intermediateResult = calculateMaxScore(initialTarget, firstOptionSet, secondOptionSet);
    const finalOutcome = calculateMaxScore(intermediateResult, secondOptionSet, firstOptionSet);

    process.stdout.write(finalOutcome.toString() + '\n');
}