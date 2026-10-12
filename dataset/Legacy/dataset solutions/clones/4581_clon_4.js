const outputWriter = console.log;

const inputSource = require("fs").readFileSync("/dev/stdin", "UTF-8");

const allInputLines = inputSource.trim().split('\n');

const firstDataRow = allInputLines.shift();
const [entryCount, positionKey] = firstDataRow.split(' ').map(Number);

const dataEntries = allInputLines;

const constructedSequence = dataEntries.flatMap(currentEntryLine => {
    const [elementValue, repetitionCount] = currentEntryLine.split(' ').map(Number);
    return Array.from({ length: repetitionCount }, () => elementValue);
});

outputWriter(constructedSequence[positionKey - 1]);
