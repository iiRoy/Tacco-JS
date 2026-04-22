function processSequenceData(inputFeed) {
    const contentLines = inputFeed.split('\n');
    const totalItems = parseInt(contentLines[0], 10);
    const itemValues = contentLines[1].split(' ').map(Number);

    const calculatedState = itemValues.reduce((accumulator, currentElement) => {
        if (currentElement === accumulator.expectedValue) {
            return {
                expectedValue: accumulator.expectedValue + 1,
                skippedCount: accumulator.skippedCount
            };
        } else {
            return {
                expectedValue: accumulator.expectedValue,
                skippedCount: accumulator.skippedCount + 1
            };
        }
    }, { expectedValue: 1, skippedCount: 0 });

    let finalOutcome = calculatedState.skippedCount;

    if (calculatedState.skippedCount === totalItems && calculatedState.expectedValue === 1) {
        finalOutcome = -1;
    }

    console.log(finalOutcome);
}

processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));