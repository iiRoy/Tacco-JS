function processInputData(rawInput) {
    const [firstLineContent, secondLineContent] = rawInput.split('\n');
    const [arrayLengthIndicator] = firstLineContent.split(' ').map(Number);
    const numericSequence = secondLineContent.split(' ').map(Number);

    if (numericSequence.length < 2) {
        console.log(0);
        return;
    }

    const initialAccumulatorState = {
        currentMinimumValue: numericSequence[0],
        maximumObservedDifference: 0,
        maximumDifferenceCount: 0
    };

    const finalResultState = numericSequence.slice(1).reduce((accumulator, currentValue) => {
        const potentialDifference = currentValue - accumulator.currentMinimumValue;

        let nextMaximumObservedDifference = accumulator.maximumObservedDifference;
        let nextMaximumDifferenceCount = accumulator.maximumDifferenceCount;

        if (potentialDifference > accumulator.maximumObservedDifference) {
            nextMaximumObservedDifference = potentialDifference;
            nextMaximumDifferenceCount = 1;
        } else if (potentialDifference === accumulator.maximumObservedDifference) {
            nextMaximumDifferenceCount++;
        }

        const nextCurrentMinimumValue = Math.min(accumulator.currentMinimumValue, currentValue);

        return {
            currentMinimumValue: nextCurrentMinimumValue,
            maximumObservedDifference: nextMaximumObservedDifference,
            maximumDifferenceCount: nextMaximumDifferenceCount
        };
    }, initialAccumulatorState);

    console.log(finalResultState.maximumDifferenceCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
