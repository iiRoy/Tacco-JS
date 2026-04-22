const streamProvider = require('node:fs');
const entireStreamData = streamProvider.readFileSync("/dev/stdin", "utf8");
const allSegments = entireStreamData.split('\n');
const finalContentPiece = allSegments[allSegments.length - 1];

const performCharTransformation = (inputChar, multiplierA, adderB) => {
    const isAlphaNumericOrUnderscore = (val) => {
        const charCodeValue = val.charCodeAt(0);
        return (charCodeValue >= 48 && charCodeValue <= 57) || // Digits 0-9
               (charCodeValue >= 65 && charCodeValue <= 90) || // Uppercase A-Z
               (charCodeValue >= 97 && charCodeValue <= 122) || // Lowercase a-z
               charCodeValue === 95; // Underscore _
    };

    if (isAlphaNumericOrUnderscore(inputChar)) {
        const originalCharCode = inputChar.charCodeAt(0);
        const newCharCode = (originalCharCode * multiplierA + adderB) % 26 + 97;
        return String.fromCharCode(newCharCode);
    }
    return inputChar;
};

const identifyKeywords = (textToSearch) => {
    return textToSearch.includes('this') || textToSearch.includes('that');
};

const runDecryptionAttempt = (sourceInput) => {
    const discoveredSolutions = [];

    for (let keyCombination = 0; keyCombination < 26 * 26; ++keyCombination) {
        const currentMultiplier = Math.floor(keyCombination / 26);
        const currentAdder = keyCombination % 26;

        const transformedCandidate = sourceInput
            .split('')
            .map(character => performCharTransformation(character, currentMultiplier, currentAdder))
            .join('');

        if (identifyKeywords(transformedCandidate)) {
            discoveredSolutions.push(transformedCandidate);
        }
    }
    return discoveredSolutions;
};

const successfulDecryptions = runDecryptionAttempt(finalContentPiece);
successfulDecryptions.forEach(result => {
    process.stdout.write(result + '\n');
});