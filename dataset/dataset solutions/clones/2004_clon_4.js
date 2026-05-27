"use strict";

const processInput = rawData => {
    const contentLines = rawData.trim().split("\n");

    const [itemCount, selectionCount] = contentLines[0].split(" ").map(Number);
    const candidateScores = contentLines[1].split(" ").map(Number);

    const sumOfAllScores = candidateScores.reduce((accumulator, currentScore) => accumulator + currentScore, 0);
    const requiredThreshold = sumOfAllScores / (4 * selectionCount);

    const sortedScores = [...candidateScores].sort((a, b) => b - a);

    const topSelectedScores = sortedScores.slice(0, selectionCount);

    const allMeetCriteria = topSelectedScores.every(scoreValue => scoreValue >= requiredThreshold);

    if (allMeetCriteria) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
