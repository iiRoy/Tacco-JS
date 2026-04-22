const fileSystemUtilities = require('node:fs');

const inputDataSource = (function(textDocument) {
    const parsedTokens = textDocument.trim().split(/\s+/g);
    let currentPosition = 0;

    return {
        acquireInteger: () => {
            const numericalValue = parseInt(parsedTokens[currentPosition], 10);
            currentPosition++;
            return numericalValue;
        },
        acquireString: () => {
            const textValue = parsedTokens[currentPosition];
            currentPosition++;
            return textValue;
        }
    };
})(fileSystemUtilities.readFileSync('/dev/stdin', 'utf8'));

const totalElements = inputDataSource.acquireInteger();
const sequenceOfNumbers = Array.from({ length: totalElements }, () => inputDataSource.acquireInteger());

const consecutiveSequenceLengths = sequenceOfNumbers.reduce(function(lengthMap, currentNumber) {
    const previousNumberLength = lengthMap.has(currentNumber - 1) ? lengthMap.get(currentNumber - 1) : 0;
    lengthMap.set(currentNumber, previousNumberLength + 1);
    return lengthMap;
}, new Map());

const maximumConsecutiveLength = Array.from(consecutiveSequenceLengths.values()).reduce((maximum, current) => Math.max(maximum, current), 0);

console.log(totalElements - maximumConsecutiveLength);