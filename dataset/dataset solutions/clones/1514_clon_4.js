const processData = () => {
    const inputLines = [];
    let lineIndex = 0;

    const retrieveNextNumber = () => {
        return parseInt(inputLines[lineIndex++], 10);
    };

    const ultimatePosition = retrieveNextNumber();
    const numberOfSegments = retrieveNextNumber();

    const adjustedTarget = ultimatePosition - 1;
    const specificModulo = 998244353;

    const permittedSteps = new Set();
    for (let segmentCounter = 0; segmentCounter < numberOfSegments; ++segmentCounter) {
        const segmentStartPoint = retrieveNextNumber();
        const segmentEndPoint = retrieveNextNumber();
        for (let currentStepSize = segmentStartPoint; currentStepSize <= segmentEndPoint; ++currentStepSize) {
            permittedSteps.add(currentStepSize);
        }
    }

    const pathMemoization = new Map();

    const calculatePathwaysToPoint = (currentDestination) => {
        if (currentDestination === 0) {
            return 1;
        }
        if (currentDestination < 0) {
            return 0;
        }
        if (pathMemoization.has(currentDestination)) {
            return pathMemoization.get(currentDestination);
        }

        let totalAccumulatedPathways = 0;
        for (const allowedIncrement of permittedSteps) {
            totalAccumulatedPathways = (totalAccumulatedPathways + calculatePathwaysToPoint(currentDestination - allowedIncrement)) % specificModulo;
        }

        pathMemoization.set(currentDestination, totalAccumulatedPathways);
        return totalAccumulatedPathways;
    };

    const finalResult = calculatePathwaysToPoint(adjustedTarget);
    console.log(finalResult);
};

// Standard input handling for a Node.js environment
const currentInputBuffer = [];
require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (line) => {
    currentInputBuffer.push(line);
}).on('close', () => {
    // Transfer collected input to the processing function's scope
    processData.inputLines = currentInputBuffer;
    processData();
});