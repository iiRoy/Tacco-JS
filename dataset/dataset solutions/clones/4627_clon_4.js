const performAnalysis = (rawDataString) => {
    const segmentData = rawDataString.split('\n');
    const elementCount = Number(segmentData[0]);
    const numericalSequence = segmentData[1].split(' ').map(Number);

    const calculateMinOperations = (sequence, initialTargetSign) => {
        const startingState = { currentCumulativeValue: 0, totalAdjustmentCost: 0 };

        const resultingState = sequence.reduce((accumulator, currentElement, elementIndex) => {
            const targetSignForThisStep = (elementIndex % 2 === 0) ? initialTargetSign : -initialTargetSign;
            const projectedCumulativeValue = accumulator.currentCumulativeValue + currentElement;

            const requiresModification = (targetSignForThisStep * projectedCumulativeValue <= 0);

            const finalCumulativeValueForStep = requiresModification ? targetSignForThisStep : projectedCumulativeValue;
            const incrementalCost = requiresModification ? Math.abs(projectedCumulativeValue - targetSignForThisStep) : 0;

            return {
                currentCumulativeValue: finalCumulativeValueForStep,
                totalAdjustmentCost: accumulator.totalAdjustmentCost + incrementalCost
            };
        }, startingState);

        return resultingState.totalAdjustmentCost;
    };

    const firstScenarioResult = calculateMinOperations(numericalSequence, 1);
    const secondScenarioResult = calculateMinOperations(numericalSequence, -1);

    return Math.min(firstScenarioResult, secondScenarioResult);
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutput = performAnalysis(inputData);
console.log(finalOutput);