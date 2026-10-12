function processInputData(inputContent) {
    const contentLines = inputContent.split("\n");
    const elementCount = parseInt(contentLines[0], 10);
    const numberStrings = contentLines[1].split(" ");
    const numericSequence = numberStrings.map(Number);

    const { sumOccurrences } = numericSequence.reduce(
        (accumulatorState, currentNumber) => {
            accumulatorState.currentCumulativeSum += currentNumber;
            accumulatorState.sumOccurrences.set(
                accumulatorState.currentCumulativeSum,
                (accumulatorState.sumOccurrences.get(accumulatorState.currentCumulativeSum) || 0) + 1
            );
            return accumulatorState;
        },
        { currentCumulativeSum: 0, sumOccurrences: new Map([[0, 1]]) }
    );

    const zeroSumSubarrayPairs = Array.from(sumOccurrences.values()).reduce(
        (totalPairs, frequencyValue) => {
            return totalPairs + (frequencyValue * (frequencyValue - 1) / 2);
        },
        0
    );

    console.log(zeroSumSubarrayPairs);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
