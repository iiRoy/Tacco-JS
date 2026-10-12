const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync(0).toString();
const inputLines = rawInputContent.split('\n');

const segmentLength = +inputLines[0];
const sourceString = inputLines[1];

const constructedStringCounts = {};

const totalMaskCombinations = 1 << segmentLength;

for (let currentBitmask = 0; currentBitmask < totalMaskCombinations; currentBitmask++) {
    let currentGeneratedString = "";
    for (let charIndex = segmentLength - 1; charIndex >= 0; charIndex--) {
        const charToProcess = sourceString[charIndex];
        const isBitSet = (currentBitmask & (1 << charIndex)) !== 0;

        if (isBitSet) {
            currentGeneratedString = charToProcess + currentGeneratedString;
        } else {
            currentGeneratedString = currentGeneratedString + charToProcess;
        }
    }
    constructedStringCounts[currentGeneratedString] = (constructedStringCounts[currentGeneratedString] || 0) + 1;
}

let overallMatchSum = 0;

const stringEndOffset = 2 * segmentLength;

for (let currentBitmask = 0; currentBitmask < totalMaskCombinations; currentBitmask++) {
    let currentGeneratedString = "";
    for (let charIndex = segmentLength - 1; charIndex >= 0; charIndex--) {
        const sourceCharActualIndex = stringEndOffset - charIndex - 1;
        const charToProcess = sourceString[sourceCharActualIndex];

        const isBitSet = (currentBitmask & (1 << charIndex)) !== 0;

        if (isBitSet) {
            currentGeneratedString = charToProcess + currentGeneratedString;
        } else {
            currentGeneratedString = currentGeneratedString + charToProcess;
        }
    }
    overallMatchSum += (constructedStringCounts[currentGeneratedString] || 0);
}

console.log(overallMatchSum);
