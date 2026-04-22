const inputData = require('fs').readFileSync(0, 'utf8');
const processedLines = inputData.trim().split('\n');

const characterSets = new Map([
    ['0', ''],
    ['1', '.,!? '],
    ['2', 'abc'],
    ['3', 'def'],
    ['4', 'ghi'],
    ['5', 'jkl'],
    ['6', 'mno'],
    ['7', 'pqrs'],
    ['8', 'tuv'],
    ['9', 'wxyz']
]);

const numberOfCases = parseInt(processedLines.shift(), 10);
const inputSequences = processedLines.slice(0, numberOfCases);

const outputResults = inputSequences.map(sequenceString => {
    const pressSegments = sequenceString.split('0');

    const decodedMessage = pressSegments.reduce((currentMessage, segment) => {
        if (segment.length === 0) {
            return currentMessage;
        }

        const initialDigit = segment[0];
        const consecutivePresses = segment.length;

        const availableChars = characterSets.get(initialDigit);
        const charPosition = (consecutivePresses - 1) % availableChars.length;

        return currentMessage + availableChars[charPosition];
    }, '');

    return decodedMessage;
});

outputResults.forEach(messageLine => {
    console.log(messageLine);
});