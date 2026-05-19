"use strict";

const processInput = (rawData) => {
    const parsedLines = rawData.trim().split("\n");

    const firstLineParts = parsedLines[0].split(" ");
    const numItems = parseInt(firstLineParts[0], 10);
    const requiredSelections = parseInt(firstLineParts[1], 10);

    const candidateScores = parsedLines[1].split(" ").map(scoreString => parseInt(scoreString, 10));

    const overallSum = candidateScores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const divisorMultiplier = 4;
    const thresholdDivisor = divisorMultiplier * requiredSelections;
    const acceptanceCriterion = overallSum / thresholdDivisor;

    candidateScores.sort((a, b) => b - a);

    let allConditionsMet = true;

    for (let loopIndex = 0; loopIndex < requiredSelections; loopIndex++) {
        const currentScore = candidateScores[loopIndex];
        if (currentScore < acceptanceCriterion) {
            allConditionsMet = false;
            break;
        }
    }

    if (allConditionsMet) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
