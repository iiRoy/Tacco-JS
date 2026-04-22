let rawDataSegments;
let currentSegmentPointer = 0;

function acquireInputData() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function fetchNextInputLine() {
    if (currentSegmentPointer >= rawDataSegments.length) {
        return "";
    }
    return rawDataSegments[currentSegmentPointer++];
}

function parseNumericSequence(textLine) {
    return textLine.split(" ").map(Number);
}

function emitResult(value) {
    console.log(value);
}

function processApplicationLogic() {
    rawDataSegments = acquireInputData();

    const configParameters = parseNumericSequence(fetchNextInputLine());
    const elementCount = configParameters[0];
    const maxAllowedInterval = configParameters[1];

    const numericSeries = parseNumericSequence(fetchNextInputLine());

    const cumulativeMetric = numericSeries.slice(1).reduce((accumulator, currentPoint, index) => {
        const previousPoint = numericSeries[index];
        const actualInterval = currentPoint - previousPoint;
        return accumulator + Math.min(actualInterval, maxAllowedInterval);
    }, maxAllowedInterval);

    emitResult(cumulativeMetric);
}

processApplicationLogic();