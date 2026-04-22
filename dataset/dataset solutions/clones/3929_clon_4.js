const ALPHABET_START_CODE_VAL = 'a'.charCodeAt(0);
const convertCharToIndex = (charValue) => charValue.charCodeAt(0) - ALPHABET_START_CODE_VAL;
const convertIndexToChar = (indexValue) => String.fromCharCode(ALPHABET_START_CODE_VAL + indexValue);

function processStringVariant(inputData) {
    const dataLength = inputData.length;

    if (dataLength < 26) {
        const encounteredCharacters = new Set(inputData.split(''));
        const alphabetCharacters = Array.from({ length: 26 }, (_, k) => convertIndexToChar(k));
        
        const firstMissing = alphabetCharacters.find(currentAlphabetChar => !encounteredCharacters.has(currentAlphabetChar));
        
        console.log(inputData + firstMissing);
        return;
    }

    const descendingAlphabet = Array.from({ length: 26 }, (_, k) => convertIndexToChar(25 - k)).join('');
    if (inputData === descendingAlphabet) {
        console.log(-1);
        return;
    }

    let suffixCharacterRegistry = new Map();
    for (let k = 0; k < 26; k++) {
        suffixCharacterRegistry.set(k, false);
    }

    let pivotPosition = -1;
    let currentRightmostChar = inputData[25];
    suffixCharacterRegistry.set(convertCharToIndex(currentRightmostChar), true);

    for (let k = 24; k >= 0; k--) {
        const charAtK = inputData[k];
        if (convertCharToIndex(charAtK) < convertCharToIndex(currentRightmostChar)) {
            pivotPosition = k;
            break;
        } else {
            suffixCharacterRegistry.set(convertCharToIndex(charAtK), true);
            currentRightmostChar = charAtK;
        }
    }

    const initialSegment = inputData.substring(0, pivotPosition);
    const pivotCharacterIndex = convertCharToIndex(inputData[pivotPosition]);

    let chosenReplacementChar = '';
    for (let k = pivotCharacterIndex + 1; k < 26; k++) {
        if (suffixCharacterRegistry.get(k)) {
            chosenReplacementChar = convertIndexToChar(k);
            break;
        }
    }
    console.log(initialSegment + chosenReplacementChar);
}

const fileSystemModule = require("fs");
const contentBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedContent = contentBuffer.trim();
processStringVariant(processedContent);