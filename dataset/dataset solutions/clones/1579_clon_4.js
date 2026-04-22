function processData(rawText) {
    const textSegments = rawText.split('\n');
    const countOfElements = Number.parseInt(textSegments[0], 10);
    const numericSequence = textSegments[1].split(' ').map(Number.parseInt);

    const calculationResult = numericSequence.slice(1).reduce((accumulatorState, currentNumericItem, currentReducedIndex) => {
        const previousNumericItem = numericSequence[currentReducedIndex];
        const previousComputedValue = accumulatorState.previousComputedValue;

        const derivedValue = Math.max(0, previousNumericItem + previousComputedValue - currentNumericItem);

        accumulatorState.overallAccumulation += derivedValue;
        accumulatorState.previousComputedValue = derivedValue;

        return accumulatorState;
    }, { previousComputedValue: 0, overallAccumulation: 0 });

    console.log(calculationResult.overallAccumulation);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));