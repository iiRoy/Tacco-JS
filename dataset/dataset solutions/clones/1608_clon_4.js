function Main(input) {
    const lines = input.trim().split("\n");
    const firstLine = lines[0].split(" ").map(Number);
    const N = firstLine[0];
    const K = firstLine[1];
    const planetNext = lines[1].split(" ").map(Number);
    const planetScores = lines[2].split(" ").map(Number);

    let overallMaxScore = -Infinity;

    const nodeCycleRegistry = new Map();

    for (let startNodeIndex = 0; startNodeIndex < N; startNodeIndex++) {
        if (nodeCycleRegistry.has(startNodeIndex)) {
            continue;
        }

        const currentPathNodes = [];
        const pathVisitOrder = new Map();
        let currentNode = startNodeIndex;
        let pathPosition = 0;

        while (!pathVisitOrder.has(currentNode)) {
            pathVisitOrder.set(currentNode, pathPosition);
            currentPathNodes.push(currentNode);
            currentNode = planetNext[currentNode] - 1;
            pathPosition++;
        }

        const cycleEntryPosition = pathVisitOrder.get(currentNode);
        const cycleNodeIndices = currentPathNodes.slice(cycleEntryPosition);
        const cycleScores = cycleNodeIndices.map(idx => planetScores[idx]);
        const cycleTotalScore = cycleScores.reduce((acc, val) => acc + val, 0);

        cycleNodeIndices.forEach((nodeIdx, offset) => {
            nodeCycleRegistry.set(nodeIdx, { cycleId: startNodeIndex, offset: offset });
        });

        const cycleLength = cycleScores.length;
        const cycleSumValue = cycleTotalScore;

        let stepsForSubpathCalculation = cycleLength;
        let fullCycleContributionMultiplier = 0;

        if (K <= cycleLength) {
            stepsForSubpathCalculation = K;
        } else {
            if (cycleSumValue > 0) {
                stepsForSubpathCalculation = K % cycleLength;
                if (stepsForSubpathCalculation === 0) {
                    stepsForSubpathCalculation = cycleLength;
                }
                fullCycleContributionMultiplier = Math.floor((K - stepsForSubpathCalculation) / cycleLength);
            } else {
                stepsForSubpathCalculation = cycleLength;
                fullCycleContributionMultiplier = 0;
            }
        }

        let maxSubpathScoreInCycle = -Infinity;

        if (stepsForSubpathCalculation > 0) {
            const extendedCycleScores = cycleScores.concat(cycleScores.slice(0, stepsForSubpathCalculation - 1));
            
            const cumulativeSums = [0];
            for (const score of extendedCycleScores) {
                cumulativeSums.push(cumulativeSums[cumulativeSums.length - 1] + score);
            }

            for (let currentStartOffset = 0; currentStartOffset < cycleLength; currentStartOffset++) {
                const currentEndOffset = currentStartOffset + stepsForSubpathCalculation;
                const windowSum = cumulativeSums[currentEndOffset] - cumulativeSums[currentStartOffset];
                maxSubpathScoreInCycle = Math.max(maxSubpathScoreInCycle, windowSum);
            }
        }

        overallMaxScore = Math.max(overallMaxScore, maxSubpathScoreInCycle + fullCycleContributionMultiplier * cycleSumValue);
    }

    console.log(overallMaxScore);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
