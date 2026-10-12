function parseInputData(rawInputString) {
    const lines = rawInputString.trim().split("\n");
    const firstLineValues = lines[0].split(" ").map(Number);
    const numNodes = firstLineValues[0];
    const maxMoves = firstLineValues[1];

    const nextNodes = lines[1].split(" ").map(Number);
    const nodeScores = lines[2].split(" ").map(Number);

    return { numNodes, maxMoves, nextNodes, nodeScores };
}

function findCycleDetails(startNodeIdx, nextNodesArr, nodeScoresArr, visitedStatusArr) {
    let cyclePath = [];
    let cycleTotalScore = 0;
    let currentNodeIdx = startNodeIdx;
    const initialNodeValue = startNodeIdx + 1;

    while (true) {
        visitedStatusArr[currentNodeIdx] = true;
        const score = nodeScoresArr[currentNodeIdx];
        cyclePath.push([currentNodeIdx + 1, score]);
        cycleTotalScore += score;

        const nextNodeValue = nextNodesArr[currentNodeIdx];
        if (nextNodeValue === initialNodeValue) {
            break;
        }
        currentNodeIdx = nextNodeValue - 1;
    }
    return { path: cyclePath, totalScore: cycleTotalScore };
}

function processInput(rawData) {
    const { numNodes, maxMoves, nextNodes, nodeScores } = parseInputData(rawData);

    let visitedNodes = Array.from({ length: numNodes }, () => false);
    let maxOverallScore = -Infinity;

    for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
        if (!visitedNodes[nodeIndex]) {
            const { path: currentCycleDetails, totalScore: currentCycleTotalScore } =
                findCycleDetails(nodeIndex, nextNodes, nodeScores, visitedNodes);

            const cycleLength = currentCycleDetails.length;
            let effectiveRemainingMoves;

            if (maxMoves <= cycleLength) {
                effectiveRemainingMoves = maxMoves;
            } else {
                if (currentCycleTotalScore > 0) {
                    effectiveRemainingMoves = maxMoves % cycleLength;
                    if (effectiveRemainingMoves === 0) {
                        effectiveRemainingMoves = cycleLength;
                    }
                } else {
                    effectiveRemainingMoves = cycleLength;
                }
            }

            let maxPartialCycleScore = -Infinity;
            for (let startOffset = 0; startOffset < cycleLength; startOffset++) {
                let currentPathScore = 0;
                for (let pathStep = 0; pathStep < effectiveRemainingMoves; pathStep++) {
                    const wrappedPathIndex = (startOffset + pathStep) % cycleLength;
                    currentPathScore += currentCycleDetails[wrappedPathIndex][1];
                    maxPartialCycleScore = Math.max(maxPartialCycleScore, currentPathScore);
                }
            }

            const numFullCyclesTraversed = Math.floor((maxMoves - effectiveRemainingMoves) / cycleLength);
            const fullCycleScoreContribution = Math.max(0, currentCycleTotalScore) * numFullCyclesTraversed;

            maxOverallScore = Math.max(maxOverallScore, maxPartialCycleScore + fullCycleScoreContribution);
        }
    }

    console.log(maxOverallScore);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
