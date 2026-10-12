const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawDataContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
const trimmedInputString = rawDataContent.trim();

const wordDelimiterPattern = /\s|\.|\,/;
const initialWordSegments = trimmedInputString.split(wordDelimiterPattern);

function isValidWordLength(wordCandidate) {
    const minLengthThreshold = 3;
    const maxLengthThreshold = 6;
    const currentWordLength = wordCandidate.length;
    const meetsMinLength = currentWordLength >= minLengthThreshold;
    const meetsMaxLength = currentWordLength <= maxLengthThreshold;
    return meetsMinLength && meetsMaxLength;
}

const filteredWords = [];

for (const wordCandidate of initialWordSegments) {
    if (isValidWordLength(wordCandidate)) {
        filteredWords.push(wordCandidate);
    }
}

const outputSeparator = " ";
console.log(filteredWords.join(outputSeparator));
