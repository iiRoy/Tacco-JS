const fileSystemModule = require('node:fs');
const rawSourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawSourceData.trim();

function obtainCharacterTallies(phrase) {
    const tally = {};
    for (const char of phrase) {
        tally[char] = (tally[char] || 0) + 1;
    }
    return tally;
}

function compareTallies(tallyA, tallyB) {
    const keysA = Object.keys(tallyA);
    const keysB = Object.keys(tallyB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (const key of keysA) {
        if (tallyA[key] !== tallyB[key]) {
            return false;
        }
    }
    return true;
}

const targetWordSequence = "AIZUNYAN";
const targetWordLength = targetWordSequence.length;
const targetWordTally = obtainCharacterTallies(targetWordSequence);

let currentPointer = 0;
let transformedFragments = [];

while (currentPointer < processedContent.length) {
    if (currentPointer + targetWordLength <= processedContent.length) {
        const currentWindow = processedContent.substring(currentPointer, currentPointer + targetWordLength);

        if (currentWindow === targetWordSequence) {
            transformedFragments.push(targetWordSequence);
            currentPointer += targetWordLength;
            continue;
        }

        const currentWindowTally = obtainCharacterTallies(currentWindow);
        if (compareTallies(targetWordTally, currentWindowTally)) {
            transformedFragments.push(targetWordSequence);
            currentPointer += targetWordLength;
            continue;
        }
    }

    transformedFragments.push(processedContent[currentPointer]);
    currentPointer++;
}

process.stdout.write(transformedFragments.join("") + '\n');