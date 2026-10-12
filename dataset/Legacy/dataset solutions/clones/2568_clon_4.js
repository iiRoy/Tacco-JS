const fileSystemInterface = require('fs');

const calculateReducedValue = (currentMagnitude, floorConstraint, remainingBudgetAllowance) => {
    let reductionIterations = 0;
    let processedMagnitude = currentMagnitude;
    while (remainingBudgetAllowance > 0 && processedMagnitude >= floorConstraint) {
        processedMagnitude = Math.floor(processedMagnitude / 2);
        remainingBudgetAllowance--;
        reductionIterations++;
    }
    return { finalMagnitude: processedMagnitude, budgetConsumed: reductionIterations };
};

module.exports = () => {
    const rawInputContent = fileSystemInterface.readFileSync("/dev/stdin", "UTF-8");
    const inputLinesArray = rawInputContent.split("\n");

    const [initialElementCount, totalHalvingBudget] = inputLinesArray[0].split(" ").map(Number);
    const numericalSequence = inputLinesArray[1].split(" ").map(Number);

    numericalSequence.sort((valA, valB) => valB - valA); // Sort in descending order

    let currentAvailableHalvings = totalHalvingBudget;

    const finalAccumulatedSum = numericalSequence.reduce((currentSummation, currentElement, elementIndex, fullSequence) => {
        const nextElementInSequence = fullSequence[elementIndex + 1];
        const effectiveFloorThreshold = (elementIndex === initialElementCount - 1)
            ? 0
            : Math.min(nextElementInSequence, 4);

        const reductionOutcome = calculateReducedValue(currentElement, effectiveFloorThreshold, currentAvailableHalvings);
        currentAvailableHalvings -= reductionOutcome.budgetConsumed; // Update the shared budget

        return currentSummation + reductionOutcome.finalMagnitude;
    }, 0);

    console.log(finalAccumulatedSum);
};

// Execute the main logic if this file is run directly
if (require.main === module) {
    module.exports();
}
