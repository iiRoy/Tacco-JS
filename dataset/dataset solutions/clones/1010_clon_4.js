const fsModule = require('node:fs');
const internalBufferSize = 1024;
const dataBuffer = Buffer.alloc(internalBufferSize);
let actualBytesRead = 0;
let fileHandle = 0;

try {
    fileHandle = fsModule.openSync('/dev/stdin', 'r');
} catch (error) {
    // If /dev/stdin is not available (e.g., Windows), fall back to FD 0
    fileHandle = 0;
}

let completeInputString = '';
let currentReadSize;
while ((currentReadSize = fsModule.readSync(fileHandle, dataBuffer, 0, internalBufferSize, null)) !== 0) {
    completeInputString += dataBuffer.toString('utf8', 0, currentReadSize);
    if (currentReadSize < internalBufferSize) break;
}
if (fileHandle !== 0) {
    fsModule.closeSync(fileHandle);
}

const inputLines = completeInputString.split(/\r?\n/);
const targetLine = inputLines[1];

const structuredElements = [];
const tokenPattern = /\S+/g;
let tokenMatch;
while ((tokenMatch = tokenPattern.exec(targetLine)) !== null) {
    const originalTokenString = tokenMatch[0];
    const numericalValue = parseInt(originalTokenString[1], 10);
    structuredElements.push([numericalValue, originalTokenString]);
}

const processSequenceA = (sourceCollection) => {
    const workingCollection = [...sourceCollection];
    const collectionLength = workingCollection.length;

    for (let passIndex = 0; passIndex < collectionLength - 1; passIndex++) {
        for (let comparisonIndex = 0; comparisonIndex < collectionLength - 1 - passIndex; comparisonIndex++) {
            const currentEntry = workingCollection[comparisonIndex];
            const nextEntry = workingCollection[comparisonIndex + 1];

            if (currentEntry[0] > nextEntry[0]) {
                workingCollection[comparisonIndex] = nextEntry;
                workingCollection[comparisonIndex + 1] = currentEntry;
            }
        }
    }
    return workingCollection;
};

const processSequenceB = (sourceCollection) => {
    const workingCollection = [...sourceCollection];
    const collectionLength = workingCollection.length;

    for (let currentPosition = 0; currentPosition < collectionLength - 1; currentPosition++) {
        let minimalElementPosition = currentPosition;

        for (let scanPosition = currentPosition + 1; scanPosition < collectionLength; scanPosition++) {
            if (workingCollection[scanPosition][0] < workingCollection[minimalElementPosition][0]) {
                minimalElementPosition = scanPosition;
            }
        }

        if (minimalElementPosition !== currentPosition) {
            const elementToMove = workingCollection[minimalElementPosition];
            workingCollection.splice(minimalElementPosition, 1);
            workingCollection.splice(currentPosition, 0, elementToMove);
        }
    }
    return workingCollection;
};

const compareCollections = (firstList, secondList) => {
    if (firstList.length !== secondList.length) {
        return false;
    }
    let matchResult = true;
    let idx = 0;
    while (idx < firstList.length) {
        if (firstList[idx][1] !== secondList[idx][1]) {
            matchResult = false;
            break;
        }
        idx++;
    }
    return matchResult;
};

const processedA = processSequenceA(structuredElements);
const processedB = processSequenceB(structuredElements);

const outputStringsA = [];
for (const item of processedA) {
    outputStringsA.push(item[1]);
}
process.stdout.write(outputStringsA.join(' ') + '\n');
process.stdout.write('Stable\n');

const outputStringsB = [];
for (const item of processedB) {
    outputStringsB.push(item[1]);
}
process.stdout.write(outputStringsB.join(' ') + '\n');

const outcomeMessage = compareCollections(processedA, processedB) ? 'Stable' : 'Not stable';
process.stdout.write(outcomeMessage + '\n');