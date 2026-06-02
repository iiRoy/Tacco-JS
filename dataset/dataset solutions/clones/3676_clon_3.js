const fileSystemModule = require("fs");
const rawInputBuffer = fileSystemModule.readFileSync(0);
const inputContentString = rawInputBuffer.toString();
const inputLinesArray = inputContentString.split('\n');

const sequenceLength = parseInt(inputLinesArray[0], 10);
const characterSequence = inputLinesArray[1];

let totalMatchesCount = 0;
const permutationFrequencyMap = {};

function constructMaskedString(sourceString, currentBitmask, lengthN, charIndexResolver) {
    let constructedString = "0";
    for (let loopCounter = lengthN - 1; loopCounter >= 0; loopCounter--) {
        const actualCharPosition = charIndexResolver(loopCounter, lengthN);
        const characterToAppend = sourceString[actualCharPosition];

        if ((currentBitmask & (1 << loopCounter)) !== 0) {
            constructedString = characterToAppend + constructedString;
        } else {
            constructedString = constructedString + characterToAppend;
        }
    }
    return constructedString;
}

const totalPermutations = 1 << sequenceLength;

const firstLoopCharIndexResolver = (loopIndex, len) => loopIndex;

for (let currentMaskValue = totalPermutations - 1; currentMaskValue >= 0; currentMaskValue--) {
    const generatedPermutationString = constructMaskedString(characterSequence, currentMaskValue, sequenceLength, firstLoopCharIndexResolver);
    permutationFrequencyMap[generatedPermutationString] = (permutationFrequencyMap[generatedPermutationString] || 0) + 1;
}

const secondLoopCharIndexResolver = (loopIndex, len) => (2 * len + (~loopIndex));

for (let currentMaskValue = totalPermutations - 1; currentMaskValue >= 0; currentMaskValue--) {
    const generatedPermutationString = constructMaskedString(characterSequence, currentMaskValue, sequenceLength, secondLoopCharIndexResolver);
    totalMatchesCount += (permutationFrequencyMap[generatedPermutationString] || 0);
}

console.log(totalMatchesCount);
