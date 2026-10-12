function processInput(rawInput) {
    const lineSegments = rawInput.split('\n');
    const [firstLineData, secondLineData] = lineSegments;

    const elementCount = Number(firstLineData.split(' ')[0]);
    const numericSequence = secondLineData.split(' ').map(Number);

    if (elementCount === 0) {
        console.log(0);
        return;
    }

    const initialCalculationState = {
        currentMinimumValue: numericSequence[0],
        maximumObservedDifference: 0,
        maximumDifferenceCount: 1,
    };

    const finalCalculationResult = numericSequence.slice(1).reduce((accumulator, currentElement) => {
        const potentialNewDifference = currentElement - accumulator.currentMinimumValue;
        let nextMaximumObservedDifference = accumulator.maximumObservedDifference;
        let nextMaximumDifferenceCount = accumulator.maximumDifferenceCount;

        if (potentialNewDifference > nextMaximumObservedDifference) {
            nextMaximumObservedDifference = potentialNewDifference;
            nextMaximumDifferenceCount = 1;
        } else if (potentialNewDifference === nextMaximumObservedDifference) {
            nextMaximumDifferenceCount++;
        }

        const updatedMinimumValue = Math.min(accumulator.currentMinimumValue, currentElement);

        return {
            currentMinimumValue: updatedMinimumValue,
            maximumObservedDifference: nextMaximumObservedDifference,
            maximumDifferenceCount: nextMaximumDifferenceCount,
        };
    }, initialCalculationState);

    console.log(finalCalculationResult.maximumDifferenceCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
