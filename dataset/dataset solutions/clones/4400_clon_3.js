'use strict';

function getNextAlphabeticalChar(charValue) {
    if (charValue === 'z') {
        return 'None';
    }
    const nextCharCode = charValue.charCodeAt(0) + 1;
    return String.fromCharCode(nextCharCode);
}

function ProcessInput(sourceString) {
    const processedString = sourceString;

    const uniqueCharsCollection = new Set(processedString);

    let orderedUniqueChars = Array.from(uniqueCharsCollection).sort();

    let finalResultChar = 'a';

    const charsToProcess = [...orderedUniqueChars].reverse();

    for (const currentCharacter of charsToProcess) {
        finalResultChar = getNextAlphabeticalChar(currentCharacter);
    }

    console.log(finalResultChar);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
