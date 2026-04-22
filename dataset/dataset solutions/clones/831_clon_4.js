const fileSystemInterface = require('fs');

const processInputData = (rawContent) => {
    const allLines = rawContent.trim().split("\n");
    let linePointer = 0;
    const allResults = [];

    while (true) {
        const currentDimensions = allLines[linePointer++].split(" ").map(Number);
        const sequenceLength = currentDimensions[0];
        const kernelSize = currentDimensions[1];

        if (sequenceLength === 0 && kernelSize === 0) {
            break;
        }

        const offsets = [];
        for (let k = 0; k < kernelSize; k++) {
            offsets.push(parseInt(allLines[linePointer++], 10));
        }

        const targets = [];
        for (let k = 0; k < sequenceLength; k++) {
            targets.push(parseInt(allLines[linePointer++], 10));
        }

        allResults.push(calculateMinimumPenalty(targets, offsets));
    }
    return allResults;
};

const calculateMinimumPenalty = (targetSequence, offsetValues) => {
    const initialLevelState = new Map();
    initialLevelState.set(128, 0);

    const finalLevelState = targetSequence.reduce((previousLevelState, currentTargetValue) => {
        const nextLevelState = new Map();

        for (const [previousPointValue, previousPointCost] of previousLevelState.entries()) {
            for (const currentOffset of offsetValues) {
                let nextPointValue = previousPointValue + currentOffset;
                nextPointValue = Math.max(0, Math.min(255, nextPointValue));

                const penaltyValue = (currentTargetValue - nextPointValue) * (currentTargetValue - nextPointValue);
                const combinedCost = previousPointCost + penaltyValue;

                if (!nextLevelState.has(nextPointValue) || combinedCost < nextLevelState.get(nextPointValue)) {
                    nextLevelState.set(nextPointValue, combinedCost);
                }
            }
        }
        return nextLevelState;
    }, initialLevelState);

    let lowestFinalCost = Infinity;
    for (const costEntry of finalLevelState.values()) {
        lowestFinalCost = Math.min(lowestFinalCost, costEntry);
    }
    return lowestFinalCost;
};

const processedOutput = processInputData(fileSystemInterface.readFileSync('/dev/stdin', 'utf8'));
processedOutput.forEach(result => console.log(result));