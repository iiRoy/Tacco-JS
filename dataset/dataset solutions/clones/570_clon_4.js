const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedText = rawInputContent.trim();

const maximumValidStartIndex = processedText.length - 4;

const iterationIndices = Array.from({
    length: Math.max(0, maximumValidStartIndex + 1)
}, (_, index) => index);

const occurrenceTally = iterationIndices.reduce((accumulator, currentPosition) => {
    const segmentToCheck = processedText.substring(currentPosition, currentPosition + 3);

    if (segmentToCheck === "JOI") {
        accumulator.joiCount++;
    }
    if (segmentToCheck === "IOI") {
        accumulator.ioiCount++;
    }
    return accumulator;
}, { joiCount: 0, ioiCount: 0 });

console.log(occurrenceTally.joiCount);
console.log(occurrenceTally.ioiCount);
