const fileSystemModule = require('fs');
const standardInputHandle = 0; // file descriptor for stdin

let inputBuffer = Buffer.alloc(1024 * 1024); // Allocate a large buffer for input
let bytesRead = fileSystemModule.readSync(standardInputHandle, inputBuffer, 0, inputBuffer.length, null);
let rawContent = inputBuffer.toString('utf8', 0, bytesRead);

const lineSeparator = '\n';
const parsedLines = rawContent.split(lineSeparator);

const primaryNumericalSequence = parsedLines[1].split(' ').map(token => parseInt(token, 10));
const secondaryNumericalSequence = parsedLines[3].split(' ').map(token => parseInt(token, 10));

function determineSharedCount(firstSeries, secondSeries) {
    const comparableElementsFromFirst = new Set();
    for (let elementOfFirst of firstSeries) {
        if (!Number.isNaN(elementOfFirst)) {
            comparableElementsFromFirst.add(elementOfFirst);
        }
    }

    let commonOccurrences = 0;
    for (let elementOfSecond of secondSeries) {
        if (!Number.isNaN(elementOfSecond) && comparableElementsFromFirst.has(elementOfSecond)) {
            commonOccurrences++;
        }
    }
    return commonOccurrences;
}

process.stdout.write(determineSharedCount(primaryNumericalSequence, secondaryNumericalSequence).toString() + '\n');