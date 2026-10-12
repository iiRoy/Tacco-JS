"use strict";

const readStdinContent = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const parseInitialParameters = (inputLines) => {
    const firstLineParts = inputLines[0].split(" ");
    const countN = parseInt(firstLineParts[0], 10);
    const maxValM = parseInt(firstLineParts[1], 10);
    const queryCountQ = parseInt(firstLineParts[2], 10);
    return { countN, maxValM, queryCountQ };
};

const parseQueryDetails = (inputLines, queryCountQ) => {
    const detailsList = [];
    for (let queryLineIndex = 1; queryLineIndex <= queryCountQ; queryLineIndex++) {
        const queryLineParts = inputLines[queryLineIndex].split(" ");
        const parsedQuery = queryLineParts.map(strElement => parseInt(strElement, 10));
        detailsList.push(parsedQuery);
    }
    return detailsList;
};

const calculateSequenceScore = (sequence, queryDetails) => {
    let currentScore = 0;
    for (let queryIndex = 0; queryIndex < queryDetails.length; queryIndex++) {
        const currentQuery = queryDetails[queryIndex];
        const indexA = currentQuery[0] - 1;
        const indexB = currentQuery[1] - 1;
        const requiredDifference = currentQuery[2];
        const scoreValue = currentQuery[3];

        const valueA = sequence[indexA];
        const valueB = sequence[indexB];

        if (valueB - valueA === requiredDifference) {
            currentScore += scoreValue;
        }
    }
    return currentScore;
};

const processInput = rawData => {
    const inputLines = rawData.trim().split("\n");

    const { countN, maxValM, queryCountQ } = parseInitialParameters(inputLines);
    const queryDetails = parseQueryDetails(inputLines, queryCountQ);

    let maxScore = 0;

    const exploreCombinations = function(startValue, currentSequence) {
        if (currentSequence.length === countN) {
            const sequenceScore = calculateSequenceScore(currentSequence, queryDetails);
            maxScore = Math.max(maxScore, sequenceScore);
            return;
        }

        for (let nextNumber = startValue; nextNumber <= maxValM; nextNumber++) {
            currentSequence.push(nextNumber);
            exploreCombinations(nextNumber, currentSequence);
            currentSequence.pop();
        }
    };

    exploreCombinations(1, []);
    console.log(maxScore);
};

processInput(readStdinContent());
