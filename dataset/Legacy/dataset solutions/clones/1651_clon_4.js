function processInputData(rawData) {
    const lineSegments = rawData.split("\n");

    const firstLineComponents = lineSegments[0].split(" ");
    const totalDataPoints = parseInt(firstLineComponents[0], 10);
    const windowLength = parseInt(firstLineComponents[1], 10);

    const secondLineComponents = lineSegments[1].split(" ");
    const numericalDataSequence = secondLineComponents.map(Number);

    const customProductAccumulator = (currentAccum, nextValue) => (currentAccum === 0 ? nextValue : currentAccum * nextValue);

    const windowResultValues = Array.from({ length: totalDataPoints - windowLength + 1 }, (_, windowStartIndex) => {
        const currentWindowSlice = numericalDataSequence.slice(windowStartIndex, windowStartIndex + windowLength);
        return currentWindowSlice.reduce(customProductAccumulator, 0);
    });

    const comparisonOutcomes = windowResultValues.slice(1).map((currentComparisonValue, indexInSliced) => {
        const previousComparisonValue = windowResultValues[indexInSliced];
        return currentComparisonValue > previousComparisonValue ? 'Yes' : 'No';
    });

    comparisonOutcomes.forEach(resultEntry => {
        console.log(resultEntry);
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
