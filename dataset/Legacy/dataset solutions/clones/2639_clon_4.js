"use strict";

const executeCalculation = (inputString) => {
    const lines = inputString.trim().split("\n");
    const [nodeCountStr, queryCountStr] = lines[0].split(" ");
    const nodeCount = parseInt(nodeCountStr);
    const queryCount = parseInt(queryCountStr);

    const edgeDefinitions = lines.slice(1, nodeCount).map(line => line.split(" ").map(Number));
    const pointAssignments = lines.slice(nodeCount, nodeCount + 1 + queryCount).map(line => line.split(" ").map(Number));

    const adjacencyMap = new Map();
    for (let i = 1; i <= nodeCount; i++) {
        adjacencyMap.set(i, []);
    }

    const scoreRegistry = new Array(nodeCount).fill(0);

    for (const [parentIdentifier, childIdentifier] of edgeDefinitions) {
        adjacencyMap.get(parentIdentifier).push(childIdentifier);
    }

    for (const [targetIdentifier, scoreValue] of pointAssignments) {
        scoreRegistry[targetIdentifier - 1] += scoreValue;
    }

    const distributeScoresRecursively = (currentIdentifier, inheritedScore) => {
        scoreRegistry[currentIdentifier - 1] += inheritedScore;

        const currentTotalScore = scoreRegistry[currentIdentifier - 1];

        for (const childIdentifier of adjacencyMap.get(currentIdentifier)) {
            distributeScoresRecursively(childIdentifier, currentTotalScore);
        }
    };

    distributeScoresRecursively(1, 0);

    console.log(scoreRegistry.join(" "));
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
