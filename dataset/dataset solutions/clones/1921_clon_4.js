"use strict";

const extractParameters = (lineContent) => {
    const [limitLength, upperValue, queryCount] = lineContent[0].split(" ").map(Number);
    const evaluationRules = lineContent.slice(1, 1 + queryCount).map(ruleText => {
        const [posA, posB, requiredDifference, rewardPoints] = ruleText.split(" ").map(Number);
        return {
            startIdx: posA - 1,
            endIdx: posB - 1,
            targetDiff: requiredDifference,
            gainedPoints: rewardPoints
        };
    });
    return {
        desiredLength: limitLength,
        maximumElement: upperValue,
        ruleset: evaluationRules
    };
};

function* generateOrderedSequences(sequenceSize, maxAllowedValue, currentSequence = [], lastAdded = 1) {
    if (currentSequence.length === sequenceSize) {
        yield currentSequence;
        return;
    }

    for (let nextCandidate = lastAdded; nextCandidate <= maxAllowedValue; nextCandidate++) {
        yield* generateOrderedSequences(
            sequenceSize,
            maxAllowedValue,
            [...currentSequence, nextCandidate],
            nextCandidate
        );
    }
}

const evaluateScore = (currentArrangement, ruleCollection) => {
    return ruleCollection.reduce((accumulatedScore, rule) => {
        const { startIdx, endIdx, targetDiff, gainedPoints } = rule;
        if (currentArrangement[endIdx] - currentArrangement[startIdx] === targetDiff) {
            return accumulatedScore + gainedPoints;
        }
        return accumulatedScore;
    }, 0);
};

const executeComputation = (sourceData) => {
    const contentSegments = sourceData.trim().split("\n");
    const { desiredLength, maximumElement, ruleset } = extractParameters(contentSegments);

    let topScoreAchieved = 0;

    for (const generatedSequence of generateOrderedSequences(desiredLength, maximumElement)) {
        const sequenceValue = evaluateScore(generatedSequence, ruleset);
        if (sequenceValue > topScoreAchieved) {
            topScoreAchieved = sequenceValue;
        }
    }

    return topScoreAchieved;
};

const runApplication = (inputSource) => {
    const rawInputContent = inputSource;
    const finalOutcome = executeComputation(rawInputContent);
    console.log(finalOutcome);
};

runApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));