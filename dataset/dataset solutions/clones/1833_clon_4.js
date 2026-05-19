"use strict";

const inputProcessor = (() => {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataTokens = rawInputContent.split(/ |\n/);
    let currentTokenIndex = 0;

    const fetchNextInteger = () => {
        return Number(dataTokens[currentTokenIndex++]);
    };

    const fetchNextBigInteger = () => {
        return BigInt(dataTokens[currentTokenIndex++]);
    };

    const fetchNumericCollection = (quantity) => {
        const collection = [];
        for (let i = 0; i < quantity; i++) {
            collection.push(Number(dataTokens[currentTokenIndex++]));
        }
        return collection;
    };

    return {
        getNextInteger: fetchNextInteger,
        getIntegerArray: fetchNumericCollection,
        getNextBig: fetchNextBigInteger
    };
})();

function calculateTreePathSum() {
    const treeDepth = inputProcessor.getNextInteger();
    const nodeCountsAtLevels = inputProcessor.getIntegerArray(treeDepth + 1);

    if (treeDepth === 0) {
        return nodeCountsAtLevels[0] === 1 ? "1" : "-1";
    }

    if (nodeCountsAtLevels[0] !== 0) {
        return "-1";
    }

    const maximumPossibleNodes = 100_000_000 * treeDepth;

    let forwardPassErrorDetected = false;
    const maxNodesAtLevel = Array.from({ length: treeDepth + 1 }).reduce((accumulatorArray, _, currentLevelIndex) => {
        if (forwardPassErrorDetected) {
            return accumulatorArray;
        }

        if (currentLevelIndex === 0) {
            accumulatorArray[0] = 1;
        } else {
            const previousLevelMax = accumulatorArray[currentLevelIndex - 1];
            let currentLevelCalculatedMax = Math.min(previousLevelMax * 2, maximumPossibleNodes);
            currentLevelCalculatedMax -= nodeCountsAtLevels[currentLevelIndex];

            if (currentLevelCalculatedMax < 0) {
                forwardPassErrorDetected = true;
                return accumulatorArray;
            }
            accumulatorArray[currentLevelIndex] = currentLevelCalculatedMax;
        }
        return accumulatorArray;
    }, new Array(treeDepth + 1));

    if (forwardPassErrorDetected) {
        return "-1";
    }

    const minRequiredNodesAtLevel = Array.from({ length: treeDepth + 1 }).reduceRight((accumulatorArray, _, currentLevelIndex) => {
        if (currentLevelIndex === treeDepth) {
            accumulatorArray[treeDepth] = 0;
        } else {
            accumulatorArray[currentLevelIndex] = accumulatorArray[currentLevelIndex + 1] + nodeCountsAtLevels[currentLevelIndex + 1];
        }
        return accumulatorArray;
    }, new Array(treeDepth + 1));

    const totalAggregatedNodes = Array.from({ length: treeDepth + 1 }).reduce((currentSum, _, levelIdx) => {
        const effectiveNodesAtCurrentLevel = Math.min(maxNodesAtLevel[levelIdx], minRequiredNodesAtLevel[levelIdx]) + nodeCountsAtLevels[levelIdx];
        return currentSum + BigInt(effectiveNodesAtCurrentLevel);
    }, 0n);

    return totalAggregatedNodes.toString();
}

const programOutput = calculateTreePathSum();
if (programOutput !== undefined) {
    console.log(programOutput);
}
