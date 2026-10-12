let totalProductAccumulator = 0;
let totalSecondValueAccumulator = 0;
let entryCounter = 0;

const fileSystemHandler = require("fs");
const standardInputSource = "/dev/stdin";
const fileContentEncoding = "utf8";
const lineSeparator = '\n';
const valueSeparator = ',';

const rawInputData = fileSystemHandler.readFileSync(standardInputSource, fileContentEncoding);
const trimmedInput = rawInputData.trim();
const inputLinesArray = trimmedInput.split(lineSeparator);

for (const currentInputLine of inputLinesArray) {
    const lineSegments = currentInputLine.split(valueSeparator);

    const firstSegmentValue = Number(lineSegments[0]);
    const secondSegmentValue = Number(lineSegments[1]);

    totalProductAccumulator += firstSegmentValue * secondSegmentValue;
    totalSecondValueAccumulator += secondSegmentValue;
    entryCounter++;
}

function calculateAndFormatOutput(productSum, secondValueSum, count) {
    const averageOfSecondValues = secondValueSum / count;
    const roundedAverage = ~~ (averageOfSecondValues + 0.5);

    return productSum + lineSeparator + roundedAverage;
}

const finalOutputString = calculateAndFormatOutput(
    totalProductAccumulator,
    totalSecondValueAccumulator,
    entryCounter
);

console.log(finalOutputString);
