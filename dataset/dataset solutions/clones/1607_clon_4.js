const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split('\n');
let [nodeCount, stepLimit] = lines[0].split(' ').map(Number);
const nextPointMap = lines[1].split(' ').map(Number);
const valueMap = lines[2].split(' ').map(Number);

// Adjust for 1-based indexing as in original
nextPointMap.unshift(null);
valueMap.unshift(null);

const analyzeTraversal = (initialPoint, totalStepsLimit, permutationData, costData) => {
    const visitedPoints = new Map(); // point -> { stepCount, cumulativeValue }
    const cumulativeValues = []; // Stores cumulative value at each step (0-indexed for step 1, 2, ...)
    const maxPeaks = []; // Stores max cumulative value up to each step

    let currentPoint = initialPoint;
    let currentCumulativeValue = 0;
    let currentMaxPeak = -Infinity; // Initialize with a very small number
    let currentStep = 0;

    while (currentStep < totalStepsLimit) {
        if (visitedPoints.has(currentPoint)) {
            // Loop detected: currentPoint was visited before
            // The path length to detect the loop is currentStep.
            // This corresponds to 'k+1' in the original code.
            return {
                kind: 'cyclic',
                totalPathLength: currentStep, // This is 'k+1' from original
                pathSumAtLoopDetection: currentCumulativeValue, // This is 'sum' from original
                pathPeakAtLoopDetection: currentMaxPeak, // This is 'peak' from original
                cumulativeValues: cumulativeValues, // For _peak calculation
                maxPeaks: maxPeaks // For _peak calculation
            };
        }

        visitedPoints.set(currentPoint, { stepCount: currentStep, cumulativeValue: currentCumulativeValue });

        // Move to the next point and add its value
        currentPoint = permutationData[currentPoint];
        const valueOfNextPoint = costData[currentPoint];

        currentCumulativeValue += valueOfNextPoint;
        currentMaxPeak = Math.max(currentMaxPeak, currentCumulativeValue);

        cumulativeValues.push(currentCumulativeValue);
        maxPeaks.push(currentMaxPeak);

        currentStep++;
    }

    // Step limit reached without detecting a loop
    return {
        kind: 'linear',
        finalMaxScore: currentMaxPeak,
        totalPathLength: currentStep,
        cumulativeValues: cumulativeValues,
        maxPeaks: maxPeaks
    };
};

const calculateOptimalScore = (startNode, totalSteps, permutationData, costData) => {
    const traversalResult = analyzeTraversal(startNode, totalSteps, permutationData, costData);

    if (traversalResult.kind === 'linear') {
        return traversalResult.finalMaxScore;
    }

    // Cyclic case
    const pathLengthToLoop = traversalResult.totalPathLength; // L = k+1 from original
    const sumToLoopDetection = traversalResult.pathSumAtLoopDetection; // S = sum from original
    const peakToLoopDetection = traversalResult.pathPeakAtLoopDetection; // P_initial = peak from original

    if (sumToLoopDetection < 0) {
        return peakToLoopDetection;
    }

    // Calculate number of full cycles that fit, matching original logic for 'times'
    const fullCycleCount = totalSteps % pathLengthToLoop ? Math.floor(totalSteps / pathLengthToLoop) : totalSteps / pathLengthToLoop - 1;
    const remainingStepsCount = totalSteps % pathLengthToLoop; // _K from original

    let peakForRemainingSegment = -Infinity;
    if (remainingStepsCount > 0) {
        // This corresponds to _peak from original, which is max of first _K steps
        peakForRemainingSegment = traversalResult.maxPeaks[remainingStepsCount - 1];
    }
    // If remainingStepsCount is 0, peakForRemainingSegment remains -Infinity,
    // which correctly makes the second option less desirable if sumToLoopDetection > 0.

    const scoreOptionA = sumToLoopDetection * (fullCycleCount - 1) + peakToLoopDetection;
    const scoreOptionB = sumToLoopDetection * fullCycleCount + peakForRemainingSegment;

    return Math.max(scoreOptionA, scoreOptionB);
};

let overallMaxScore = -Infinity; // Initialize with a very small number
for (let currentStartNode = 1; currentStartNode <= nodeCount; currentStartNode++) {
    overallMaxScore = Math.max(overallMaxScore, calculateOptimalScore(currentStartNode, stepLimit, nextPointMap, valueMap));
}
console.log(overallMaxScore);
