const parseRawData = (sourceText) => {
    const dataLines = sourceText.split('\n').filter(line => line.trim() !== '');
    let currentLineIndex = 0;

    const extractNumbers = () => dataLines[currentLineIndex++].split(' ').map(Number);

    const parameters = extractNumbers();
    const nodeQuantity = parameters[0];
    const maximumIterations = parameters[1];

    const nextNodeMappings = extractNumbers().map(val => val - 1);
    const nodeRewards = extractNumbers();

    return { nodeQuantity, maximumIterations, nextNodeMappings, nodeRewards };
};

function* generateTraversalData(originNode, mappingsArray, rewardsArray) {
    let currentPosition = originNode;
    let totalRewardAccumulated = 0;
    let iterationCount = 0;

    while (true) {
        currentPosition = mappingsArray[currentPosition];
        totalRewardAccumulated += rewardsArray[currentPosition];
        iterationCount++;
        yield { nodeIdentifier: currentPosition, accumulatedReward: totalRewardAccumulated, traversalSteps: iterationCount };
        if (currentPosition === originNode) {
            break;
        }
    }
}

const computeOptimalJourneyReward = (quantityNodes, iterationLimit, nodeLinks, nodeScores) => {

    const lowestPossibleReward = BigInt('-2000000000000000000');
    let highestOverallReward = lowestPossibleReward;

    Array.from({ length: quantityNodes }, (_, initialNodeIndex) => {

        const cycleSegments = [];
        for (const segment of generateTraversalData(initialNodeIndex, nodeLinks, nodeScores)) {
            if (segment.traversalSteps > iterationLimit) {
                break;
            }
            cycleSegments.push(segment);
        }

        const pathCycleLength = cycleSegments.length;
        if (pathCycleLength === 0) return;

        const fullCycleReward = cycleSegments[pathCycleLength - 1].accumulatedReward;

        cycleSegments.forEach(segment => {
            const currentStepsUsed = segment.traversalSteps;
            let currentPotentialReward;

            if (fullCycleReward > 0) {
                const remainingIterations = iterationLimit - currentStepsUsed;
                const fullCyclesToRepeat = pathCycleLength > 0 ? Math.floor(remainingIterations / pathCycleLength) : 0;
                currentPotentialReward = BigInt(segment.accumulatedReward) + BigInt(fullCyclesToRepeat) * BigInt(fullCycleReward);
            } else {
                currentPotentialReward = BigInt(segment.accumulatedReward);
            }

            if (currentPotentialReward > highestOverallReward) {
                highestOverallReward = currentPotentialReward;
            }
        });
    });

    return highestOverallReward;
};

const applicationEntry = () => {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedData = parseRawData(rawSystemInput);

    const finalCalculatedReward = computeOptimalJourneyReward(
        processedData.nodeQuantity,
        processedData.maximumIterations,
        processedData.nextNodeMappings,
        processedData.nodeRewards
    );

    if (finalCalculatedReward !== undefined) {
        console.log(String(finalCalculatedReward));
    }
};

applicationEntry();