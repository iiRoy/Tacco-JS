const fileSystem = require("fs");

const rawInputBuffer = fileSystem.readFileSync(0);
const inputString = rawInputBuffer.toString();
const inputLines = inputString.split('\n');

const charCountStr = inputLines[0];
const charCount = parseInt(charCountStr, 10);
const charSequence = inputLines[1];

const generatedStringCounts = new Map();

function generatePermutedString(bitmaskValue, length, sourceCharacters, charOffset = 0) {
    let currentPermutation = '';
    for (let charIndex = length - 1; charIndex >= 0; charIndex--) {
        const charToUse = sourceCharacters[charOffset + charIndex];
        if (bitmaskValue & (1 << charIndex)) {
            currentPermutation = charToUse + currentPermutation;
        } else {
            currentPermutation = currentPermutation + charToUse;
        }
    }
    return currentPermutation;
}

const maxBitmask = 1 << charCount;

for (let mask = 0; mask < maxBitmask; mask++) {
    const constructedString = generatePermutedString(mask, charCount, charSequence, 0);
    generatedStringCounts.set(constructedString, (generatedStringCounts.get(constructedString) || 0) + 1);
}

let finalAccumulatedSum = 0;

for (let mask = 0; mask < maxBitmask; mask++) {
    let currentPermutationForSum = '';
    for (let charIndex = charCount - 1; charIndex >= 0; charIndex--) {
        const charFromSecondPart = charSequence[2 * charCount - charIndex - 1];
        if (mask & (1 << charIndex)) {
            currentPermutationForSum = charFromSecondPart + currentPermutationForSum;
        } else {
            currentPermutationForSum = currentPermutationForSum + charFromSecondPart;
        }
    }
    finalAccumulatedSum += generatedStringCounts.get(currentPermutationForSum) || 0;
}

console.log(finalAccumulatedSum);
