const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let remainingLines = fileContent.trim().split("\n");

const consumeLine = () => remainingLines.shift();
const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

while (true) {
    const currentDimensions = parseNumericLine(consumeLine());
    const [numTargets, numDeltas] = currentDimensions;

    if (numTargets === 0 && numDeltas === 0) break;

    const deltaAdjustments = Array.from({ length: numDeltas }, () => Number(consumeLine()));
    const targetPoints = Array.from({ length: numTargets }, () => Number(consumeLine()));

    const initialPathCosts = Array(256).fill(Infinity);
    initialPathCosts[128] = 0;

    const finalPathCosts = targetPoints.reduce((previousStateCosts, currentTargetPoint) => {
        const nextStateCosts = Array(256).fill(Infinity);

        previousStateCosts.forEach((costFromPrevState, prevStateValue) => {
            if (costFromPrevState === Infinity) return;

            deltaAdjustments.forEach(deltaVal => {
                const potentialNextState = prevStateValue + deltaVal;
                const actualNextState = Math.max(0, Math.min(255, potentialNextState));
                const currentStepCost = (currentTargetPoint - actualNextState) * (currentTargetPoint - actualNextState);
                const totalCostToNextState = costFromPrevState + currentStepCost;
                nextStateCosts[actualNextState] = Math.min(nextStateCosts[actualNextState], totalCostToNextState);
            });
        });
        return nextStateCosts;
    }, initialPathCosts);

    const overallMinimumCost = finalPathCosts.reduce((minSoFar, currentCost) => Math.min(minSoFar, currentCost), Infinity);
    console.log(overallMinimumCost);
}
