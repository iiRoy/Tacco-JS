const obtainSource = require('fs');

const processSequence = (sourceText, currentPosition = 0, accumulatedResult = '') => {
    if (currentPosition >= sourceText.length) {
        return accumulatedResult;
    }

    const charOne = sourceText[currentPosition];
    const charTwo = sourceText[currentPosition + 1];

    const isCharOneP_or_Q = charOne === 'P' || charOne === '?';
    const isCharTwoD_or_Q = charTwo === 'D' || charTwo === '?';

    if (currentPosition + 1 < sourceText.length && isCharOneP_or_Q && isCharTwoD_or_Q) {
        return processSequence(sourceText, currentPosition + 2, accumulatedResult + 'PD');
    } else if (charOne === '?') {
        return processSequence(sourceText, currentPosition + 1, accumulatedResult + 'D');
    } else {
        return processSequence(sourceText, currentPosition + 1, accumulatedResult + charOne);
    }
};

const rawData = obtainSource.readFileSync('/dev/stdin', 'utf8');
const lines = rawData.split('\n');
const primaryLine = lines[0];

console.log(processSequence(primaryLine));
