const ALPHABET_SIZE = 26;
const ASCII_OFFSET_A = 'a'.charCodeAt(0);

function getAlphabeticalIndex(char) {
    return char.charCodeAt(0) - ASCII_OFFSET_A;
}

function getCharFromIndex(index) {
    return String.fromCharCode(index + ASCII_OFFSET_A);
}

function calculateCharFrequencies(inputString) {
    let charCounts = new Array(ALPHABET_SIZE).fill(0);
    for (let charIdx = 0; charIdx < inputString.length; charIdx++) {
        const alphabetIndex = getAlphabeticalIndex(inputString[charIdx]);
        charCounts[alphabetIndex]++;
    }
    return charCounts;
}

function intersectFrequencies(currentFrequencies, otherFrequencies) {
    return Array.from({ length: ALPHABET_SIZE }, (_, alphaPos) => {
        return Math.min(currentFrequencies[alphaPos], otherFrequencies[alphaPos]);
    });
}

function processInputData(rawData) {
    const lines = rawData.split("\n");
    const numStrings = parseInt(lines[0], 10);
    const inputStringList = lines.slice(1, numStrings + 1);

    let minCharFrequencies = calculateCharFrequencies(inputStringList[0]);

    for (let strIndex = 1; strIndex < inputStringList.length; strIndex++) {
        const otherFrequencies = calculateCharFrequencies(inputStringList[strIndex]);
        minCharFrequencies = intersectFrequencies(minCharFrequencies, otherFrequencies);
    }

    const resultChars = [];
    for (let charVal = 0; charVal < ALPHABET_SIZE; charVal++) {
        const charCount = minCharFrequencies[charVal];
        for (let countIter = 0; countIter < charCount; countIter++) {
            resultChars.push(getCharFromIndex(charVal));
        }
    }
    const resultString = resultChars.join('');

    console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
