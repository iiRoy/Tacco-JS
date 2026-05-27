const processInputData = (rawData) => {
    const dataSegments = rawData.split('\n');
    const [nodeQuantity, iterationLimit] = dataSegments[0].split(' ').map(Number);
    const permutationSequence = dataSegments[1].split(' ').map(Number);
    const costSequence = dataSegments[2].split(' ').map(Number);

    permutationSequence.unshift(null);
    costSequence.unshift(null);

    return { nodeQuantity, iterationLimit, permutationSequence, costSequence };
};

const analyzePathTraversal = (initialNode, maxIterations, permMap, costMap) => {
    const pathHistory = [];
    const visitedIndices = new Map();

    let currentNode = initialNode;
    let currentScore = 0;
    let highestScoreEncountered = -Infinity;
    let cycleDetails = null;

    let stepCount = 0;
    while (stepCount < maxIterations) {
        if (visitedIndices.has(currentNode)) {
            const cycleStartStep = visitedIndices.get(currentNode);
            const cycleTotal = currentScore - pathHistory[cycleStartStep].score;
            cycleDetails = { cycleStartStep, cycleEndStep: stepCount, cycleTotal };
            break;
        }

        visitedIndices.set(currentNode, stepCount);
        pathHistory.push({ node: currentNode, score: currentScore });
        highestScoreEncountered = Math.max(highestScoreEncountered, currentScore);

        currentNode = permMap[currentNode];
        currentScore += costMap[currentNode];
        stepCount++;
    }

    highestScoreEncountered = Math.max(highestScoreEncountered, currentScore);

    return { pathHistory, cycleDetails, highestScoreEncountered, finalScore: currentScore, finalStepCount: stepCount };
};

const calculateFinalOutcome = (pathAnalysis, totalIterations, permMap, costMap) => {
    const { pathHistory, cycleDetails, highestScoreEncountered, finalScore, finalStepCount } = pathAnalysis;

    if (!cycleDetails) {
        return highestScoreEncountered;
    }

    const { cycleStartStep, cycleEndStep, cycleTotal } = cycleDetails;

    if (cycleTotal <= 0) {
        return highestScoreEncountered;
    }

    const cycleLength = cycleEndStep - cycleStartStep;
    const remainingIterations = totalIterations - finalStepCount;
    const fullCycleRepeats = Math.floor(remainingIterations / cycleLength);
    const partialCycleIterations = remainingIterations % cycleLength;

    let currentAccumulatedScore = finalScore + cycleTotal * fullCycleRepeats;
    let maxScoreFromRemainder = Math.max(highestScoreEncountered, currentAccumulatedScore);

    let tempNode = pathHistory[cycleStartStep].node;
    for (let i = 0; i < partialCycleIterations; i++) {
        tempNode = permMap[tempNode];
        currentAccumulatedScore += costMap[tempNode];
        maxScoreFromRemainder = Math.max(maxScoreFromRemainder, currentAccumulatedScore);
    }

    return maxScoreFromRemainder;
};

var input = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`

const { nodeQuantity, iterationLimit, permutationSequence, costSequence } = processInputData(input);

const allStartingPoints = Array.from({ length: nodeQuantity }, (_, idx) => idx + 1);

const overallMaxResult = allStartingPoints.reduce((currentOverallMax, startPoint) => {
    const analysisResult = analyzePathTraversal(startPoint, iterationLimit, permutationSequence, costSequence);
    const calculatedScore = calculateFinalOutcome(analysisResult, iterationLimit, permutationSequence, costSequence);
    return Math.max(currentOverallMax, calculatedScore);
}, -Infinity);

console.log(overallMaxResult);
