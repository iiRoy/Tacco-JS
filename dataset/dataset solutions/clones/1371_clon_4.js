const textBlob = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineExtractor = /(.*)(?:\r?\n|$)/g;
let regexMatch;
const extractedRows = [];

while ((regexMatch = lineExtractor.exec(textBlob)) !== null) {
    if (regexMatch[1] === '') {
        continue;
    }
    extractedRows.push(regexMatch[1]);
}

function sumIndividualDigits(numericalPhrase) {
    let accumulatedSum = 0;
    let position = 0;
    const phraseLength = numericalPhrase.length;

    while (position < phraseLength) {
        const characterCodePoint = numericalPhrase.charCodeAt(position);
        accumulatedSum += (characterCodePoint - 48);
        position++;
    }
    return accumulatedSum;
}

function traverseAndCompute(entryCollection, currentPosition) {
    if (currentPosition >= entryCollection.length) {
        return;
    }

    const currentEntry = entryCollection[currentPosition];

    if (currentEntry === '0') {
        return;
    }

    const computedValue = sumIndividualDigits(currentEntry);
    process.stdout.write(computedValue + '\n');

    traverseAndCompute(entryCollection, currentPosition + 1);
}

traverseAndCompute(extractedRows, 0);