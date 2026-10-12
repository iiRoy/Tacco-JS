const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const contentLines = rawInputData.split('\n');
let targetString = contentLines.shift();

let finalResult = '';

if (targetString.length === 26) {
    const stringLength = targetString.length;
    let suffixCharacters = [];
    let resultFound = false;

    // Helper function to find a lexicographically greater candidate
    const findLexicographicalCandidate = (currentPrefixSegment, availableSuffixChars, originalFullString) => {
        for (let innerIdx = 0; innerIdx < availableSuffixChars.length; innerIdx++) {
            const candidateString = currentPrefixSegment + availableSuffixChars[innerIdx];
            if (candidateString > originalFullString) {
                return candidateString;
            }
        }
        return null; // No suitable candidate found
    };

    for (let outerIndex = stringLength - 1; outerIndex >= 0; outerIndex--) {
        suffixCharacters.push(targetString[outerIndex]);
        suffixCharacters.sort(); // Sorting is crucial for the original logic's behavior

        const currentPrefixSegment = targetString.slice(0, outerIndex);
        const potentialResult = findLexicographicalCandidate(currentPrefixSegment, suffixCharacters, targetString);

        if (potentialResult !== null) {
            finalResult = potentialResult;
            resultFound = true;
            break;
        }
    }

    if (!resultFound) {
        finalResult = -1;
    }
} else {
    let charTracker = {}; // Object to track character presence
    // Populate charTracker with characters present in targetString
    for (let outerIndex = 0; outerIndex < targetString.length; outerIndex++) {
        charTracker[targetString[outerIndex]] = 1;
    }

    let missingCharCandidate = '';
    // Iterate through ASCII values for 'A' to 'Z' to find the first missing lowercase character
    for (let charCode = 65; charCode < 91; charCode++) {
        const currentLowerChar = String.fromCharCode(charCode).toLowerCase();
        if (!charTracker[currentLowerChar]) { // Check if character is not in charTracker (or its value is falsy)
            missingCharCandidate = currentLowerChar;
            break;
        }
    }
    finalResult = targetString + missingCharCandidate;
}

console.log(finalResult);
