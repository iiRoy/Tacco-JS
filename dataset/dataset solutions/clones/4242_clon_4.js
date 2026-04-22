const analyzeNumericSeries = (sourceDataText) => {
    const dataLines = sourceDataText.trim().split('\n');
    const firstLineMetrics = dataLines[0].split(' ').map(Number);
    const referenceValue = firstLineMetrics[2];

    const numberSequence = dataLines[1].split(' ').map(Number);

    const { highestElement, lowestElement } = numberSequence.reduce(
        (extremes, currentNumber) => ({
            highestElement: Math.max(extremes.highestElement, currentNumber),
            lowestElement: Math.min(extremes.lowestElement, currentNumber),
        }),
        { highestElement: -Infinity, lowestElement: Infinity }
    );

    const terminalElement = numberSequence[numberSequence.length - 1];

    const divergenceA = Math.abs(highestElement - referenceValue);
    const divergenceB = Math.abs(highestElement - terminalElement);
    const divergenceC = Math.abs(terminalElement - lowestElement);

    return Math.max(divergenceA, divergenceB, divergenceC);
};

console.log(analyzeNumericSeries(require("fs").readFileSync("/dev/stdin", "utf8")));