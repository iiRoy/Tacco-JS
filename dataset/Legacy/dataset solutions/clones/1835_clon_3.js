"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.trim().split(/ |\n/);
var tokenIndex = 0;

function readNextNumber() {
    return +tokenStream[tokenIndex++];
}

function solveProblem() {
    let levelCount = readNextNumber();
    let requiredNodesAtLevel = Array(levelCount + 1);
    for (let i = 0; i <= levelCount; i++) {
        requiredNodesAtLevel[i] = readNextNumber();
    }

    let currentNodes = Array(levelCount + 1);
    let totalNodes = 1;
    currentNodes[0] = 1;

    for (let currentLevel = 0; currentLevel < levelCount; currentLevel++) {
        const nodesAtCurrentLevel = currentNodes[currentLevel];
        const requiredAtThisLevel = requiredNodesAtLevel[currentLevel];

        let nextLevelCalculatedNodes = (nodesAtCurrentLevel - requiredAtThisLevel) * 2;

        if (nextLevelCalculatedNodes <= 0) {
            console.log(-1);
            return;
        }
        currentNodes[currentLevel + 1] = nextLevelCalculatedNodes;
        totalNodes += nextLevelCalculatedNodes;
    }

    const finalLevelActualNodes = currentNodes[levelCount];
    const finalLevelRequiredNodes = requiredNodesAtLevel[levelCount];

    if (finalLevelActualNodes < finalLevelRequiredNodes) {
        console.log(-1);
    } else if (finalLevelActualNodes === finalLevelRequiredNodes) {
        console.log(totalNodes);
    } else {
        let maxAllowedNodes = Array(levelCount + 1);
        maxAllowedNodes[levelCount] = finalLevelRequiredNodes;

        for (let levelIdx = levelCount; levelIdx > 0; levelIdx--) {
            const maxAllowedAtThisLevel = maxAllowedNodes[levelIdx];
            const actualNodesAtThisLevel = currentNodes[levelIdx];
            const requiredAtPreviousLevel = requiredNodesAtLevel[levelIdx - 1];

            if (maxAllowedAtThisLevel < actualNodesAtThisLevel) {
                const currentExcess = actualNodesAtThisLevel - maxAllowedAtThisLevel;
                totalNodes -= currentExcess;
                maxAllowedNodes[levelIdx - 1] = maxAllowedAtThisLevel + requiredAtPreviousLevel;
            } else {
                maxAllowedNodes[levelIdx - 1] = actualNodesAtThisLevel + requiredAtPreviousLevel;
            }
        }

        const rootMaxAllowed = maxAllowedNodes[0];
        const rootActualNodes = currentNodes[0];
        if (rootMaxAllowed < rootActualNodes) {
            totalNodes -= (rootActualNodes - rootMaxAllowed);
        }
        console.log(totalNodes);
    }
}

solveProblem();
