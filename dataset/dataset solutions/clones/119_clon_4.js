const fileSystem = require("fs");

const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenSequence = inputData.split(' ');

const processingResult = tokenSequence.reduce((accumulatorState, currentToken) => {
    const currentTokenCount = (accumulatorState.tokenCounts.get(currentToken) || 0) + 1;
    accumulatorState.tokenCounts.set(currentToken, currentTokenCount);

    if (currentTokenCount > accumulatorState.highestFrequency) {
        accumulatorState.highestFrequency = currentTokenCount;
        accumulatorState.dominantToken = currentToken;
    }

    const currentTokenLength = currentToken.length;
    if (currentTokenLength > accumulatorState.greatestLength) {
        accumulatorState.greatestLength = currentTokenLength;
        accumulatorState.extendedToken = currentToken;
    }

    return accumulatorState;
}, {
    tokenCounts: new Map(),
    highestFrequency: 0,
    dominantToken: '',
    greatestLength: 0,
    extendedToken: ''
});

console.log(processingResult.dominantToken + ' ' + processingResult.extendedToken);
