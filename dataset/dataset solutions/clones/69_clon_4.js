const retrieveSystemModule = require;
const readContentFromFile = retrieveSystemModule('node:fs').readFileSync;
const rawDataString = readContentFromFile('/dev/stdin', 'utf8');
const characterArray = rawDataString.split('');
const detectionKeywords = ['the', 'this', 'that'];
const alphaSpan = 26;
const lowerACharCode = 'a'.charCodeAt(0);

const shiftTransformations = Array.from({ length: alphaSpan }, (_, currentShiftAmount) => {
    const charShiftMap = new Map();
    for (let charOffset = 0; charOffset < alphaSpan; charOffset++) {
        const originalChar = String.fromCharCode(lowerACharCode + charOffset);
        const shiftedChar = String.fromCharCode((charOffset + currentShiftAmount) % alphaSpan + lowerACharCode);
        charShiftMap.set(originalChar, shiftedChar);
    }
    return charShiftMap;
});

const applySingleCharShift = (inputChar, currentShiftMap) => {
    return currentShiftMap.has(inputChar) ? currentShiftMap.get(inputChar) : inputChar;
};

const verifyKeywordsPresent = (processedText, keywordsList) => {
    return keywordsList.some(keyword => processedText.includes(keyword));
};

const decipherRecursively = (currentIterationShift, sourceChars, searchTerms) => {
    if (currentIterationShift >= alphaSpan) {
        return null;
    }

    const activeShiftMap = shiftTransformations[currentIterationShift];
    const transformedString = sourceChars.map(individualCharacter =>
        applySingleCharShift(individualCharacter, activeShiftMap)
    ).join('');

    if (verifyKeywordsPresent(transformedString, searchTerms)) {
        return transformedString;
    } else {
        return decipherRecursively(currentIterationShift + 1, sourceChars, searchTerms);
    }
};

const finalDecipheredString = decipherRecursively(0, characterArray, detectionKeywords);
process.stdout.write(finalDecipheredString + '\n');