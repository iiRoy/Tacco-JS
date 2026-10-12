const initialProcessingState = {
    numberCounts: new Map(),
    peakCount: 0
};

const inputLines = require("node:fs").readFileSync("/dev/stdin", "utf8").split('\n');

const finalProcessingResult = inputLines.reduce((accumulator, currentLine) => {
    const parsedNumber = Number(currentLine);
    if (parsedNumber) {
        let currentEntryCount = accumulator.numberCounts.get(parsedNumber);

        let updatedEntryCount;
        if (typeof currentEntryCount === 'number' && !Number.isNaN(currentEntryCount)) {
            updatedEntryCount = currentEntryCount + 1;
        } else {
            updatedEntryCount = Number.NaN;
        }
        accumulator.numberCounts.set(parsedNumber, updatedEntryCount);

        accumulator.peakCount = (updatedEntryCount > accumulator.peakCount) ? updatedEntryCount : accumulator.peakCount;
    }
    return accumulator;
}, initialProcessingState);

const { numberCounts: finalCountsMap, peakCount: finalPeakValue } = finalProcessingResult;

for (const [keyIdentifier, valueIdentifier] of finalCountsMap.entries()) {
    if (valueIdentifier == finalPeakValue) {
        console.log(keyIdentifier);
    }
}
