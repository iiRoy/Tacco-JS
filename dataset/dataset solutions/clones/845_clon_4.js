const dataSource = require('node:fs');
const rawContent = dataSource.readFileSync('/dev/stdin', 'utf8');
let currentText = rawContent.trim();

const wordMap = {
    "egg": "X",
    "chicken": "Y"
};

const processInitialWords = (sourceText) => {
    let resultBuffer = '';
    let cursor = 0;
    while (cursor < sourceText.length) {
        if (sourceText.substring(cursor, cursor + 3) === 'egg') {
            resultBuffer += wordMap['egg'];
            cursor += 3;
        } else if (sourceText.substring(cursor, cursor + 7) === 'chicken') {
            resultBuffer += wordMap['chicken'];
            cursor += 7;
        } else {
            resultBuffer += sourceText[cursor];
            cursor++;
        }
    }
    return resultBuffer;
};

currentText = processInitialWords(currentText);

function resolveConsecutivePairs(sequenceString) {
    if (!sequenceString.includes('XX') && !sequenceString.includes('YY')) {
        return sequenceString;
    }
    let modifiedString = sequenceString;
    if (modifiedString.includes('XX')) {
        modifiedString = modifiedString.replace(/XX/g, 'XZX');
    }
    if (modifiedString.includes('YY')) {
        modifiedString = modifiedString.replace(/YY/g, 'YZY');
    }
    return resolveConsecutivePairs(modifiedString);
}

currentText = resolveConsecutivePairs(currentText);

const tokenizedParts = currentText.split('Z');

const findMaximumLengthSegment = tokenizedParts.reduce((currentMax, currentPart) => {
    return currentPart.length > currentMax.length ? currentPart : currentMax;
}, '');

const finalDecisionMap = {
    'X': 'egg',
    'Y': 'chicken',
    'default': 'chicken' // Handles empty string case where lastChar is undefined
};

const lastCharacterOfLongest = findMaximumLengthSegment[findMaximumLengthSegment.length - 1];

if (lastCharacterOfLongest === 'X') {
    console.log(finalDecisionMap['X']);
} else if (lastCharacterOfLongest === 'Y') {
    console.log(finalDecisionMap['Y']);
} else {
    // This branch handles cases like an empty findMaximumLengthSegment
    // where lastCharacterOfLongest would be undefined.
    console.log(finalDecisionMap['default']);
}