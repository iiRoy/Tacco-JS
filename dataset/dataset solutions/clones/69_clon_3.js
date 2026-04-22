const ALPHABET_LENGTH = 26;
const LOWERCASE_A_ASCII = 'a'.charCodeAt(0);

const isLowercaseAlphabet = (charToTest) => {
    return charToTest >= 'a' && charToTest <= 'z';
};

const performCaesarCharShift = (originalChar, shiftOffset) => {
    if (!isLowercaseAlphabet(originalChar)) {
        return originalChar;
    }

    const charAsciiValue = originalChar.charCodeAt(0);
    const shiftedRelativePosition = (charAsciiValue - LOWERCASE_A_ASCII + shiftOffset) % ALPHABET_LENGTH;
    return String.fromCharCode(shiftedRelativePosition + LOWERCASE_A_ASCII);
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const characterSequence = Array.from(rawInputData);

let finalDecipheredText = null;

const KEY_PHRASES = ['the', 'this', 'that'];

for (let currentShiftAmount = 0; currentShiftAmount < ALPHABET_LENGTH; currentShiftAmount++) {
    const potentialDecryptionCandidate = characterSequence.reduce((accumulatedString, currentCharacter) => {
        const processedCharacter = performCaesarCharShift(currentCharacter, currentShiftAmount);
        return accumulatedString + processedCharacter;
    }, '');

    let foundKeywordInCandidate = false;
    for (const phrase of KEY_PHRASES) {
        if (potentialDecryptionCandidate.includes(phrase)) {
            foundKeywordInCandidate = true;
            break;
        }
    }

    if (foundKeywordInCandidate) {
        finalDecipheredText = potentialDecryptionCandidate;
        break;
    }
}

console.log(finalDecipheredText !== null ? finalDecipheredText : "No decipherable message found.");