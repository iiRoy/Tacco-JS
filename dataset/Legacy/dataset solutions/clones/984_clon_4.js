const inputSettings = { sourcePath: '/dev/stdin', lineDelimiter: '\n' };

const fileSystemModule = require('fs');

let rawInputLines = fileSystemModule.readFileSync(inputSettings.sourcePath, 'ascii')
  .split(inputSettings.lineDelimiter);

const mainText = rawInputLines[0];
const patternCount = Number(rawInputLines[1]);
const patternsToFind = rawInputLines.slice(2, 2 + patternCount);

rawInputLines = null;

function findPatternWithRabinKarp(textContent, searchPattern, baseAlphabetSize, modulusPrime) {
    const textLength = textContent.length;
    const patternLength = searchPattern.length;

    if (patternLength === 0) return 1;
    if (patternLength > textLength) return 0;

    const ensurePositiveMod = (value, modVal) => ((value % modVal) + modVal) % modVal;

    let highestPowerFactor = 1;
    for (let k = 0; k < patternLength - 1; k++) {
        highestPowerFactor = ensurePositiveMod(highestPowerFactor * baseAlphabetSize, modulusPrime);
    }

    let patternHashValue = 0;
    let currentWindowHashValue = 0;

    for (let k = 0; k < patternLength; k++) {
        patternHashValue = ensurePositiveMod(patternHashValue * baseAlphabetSize + searchPattern.charCodeAt(k), modulusPrime);
        currentWindowHashValue = ensurePositiveMod(currentWindowHashValue * baseAlphabetSize + textContent.charCodeAt(k), modulusPrime);
    }

    for (let shiftIndex = 0; shiftIndex <= textLength - patternLength; shiftIndex++) {
        if (patternHashValue === currentWindowHashValue) {
            if (searchPattern === textContent.substring(shiftIndex, shiftIndex + patternLength)) {
                return 1;
            }
        }

        if (shiftIndex < textLength - patternLength) {
            const charToRemoveCode = textContent.charCodeAt(shiftIndex);
            const charToAddCode = textContent.charCodeAt(shiftIndex + patternLength);

            let termToRemove = ensurePositiveMod(charToRemoveCode * highestPowerFactor, modulusPrime);
            let intermediateHash = ensurePositiveMod(currentWindowHashValue - termToRemove, modulusPrime);

            currentWindowHashValue = ensurePositiveMod(intermediateHash * baseAlphabetSize + charToAddCode, modulusPrime);
        }
    }

    return 0;
}

const alphabetBase = 256;
const largePrimeModulus = Math.pow(2, 31) - 1;

for (let patternIndex = 0; patternIndex < patternsToFind.length; patternIndex++) {
    const currentPattern = patternsToFind[patternIndex];
    const matchOutcome = findPatternWithRabinKarp(mainText, currentPattern, alphabetBase, largePrimeModulus);
    console.log(matchOutcome);
}
