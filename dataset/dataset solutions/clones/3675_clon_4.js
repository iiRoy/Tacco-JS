const inputData = ("" + require("fs").readFileSync(0)).split('\n');
const initialNumericString = inputData[0];
const numericValue = parseInt(initialNumericString);
const sourceSequence = inputData[1];

const permutationFrequencies = {};
let finalAccumulator = 0;

const generatePermutation = (baseSegment, length, bitmask, charSourceResolver) => {
    const reverseIndices = Array.from({ length: length }, (_, index) => length - 1 - index);

    return reverseIndices.reduce((currentResult, originalIndex) => {
        const characterToUse = charSourceResolver(originalIndex);
        return (bitmask >> originalIndex) & 1 ? characterToUse + currentResult : currentResult + characterToUse;
    }, baseSegment);
};

const allBitmasks = Array.from({ length: 1 << numericValue }, (_, maskIndex) => maskIndex);

allBitmasks.forEach(currentMask => {
    const firstPartCharResolver = (idx) => sourceSequence[idx];
    const constructedSequence = generatePermutation(initialNumericString, numericValue, currentMask, firstPartCharResolver);
    permutationFrequencies[constructedSequence] = (permutationFrequencies[constructedSequence] || 0) + 1;
});

allBitmasks.forEach(currentMask => {
    const secondPartCharResolver = (idx) => sourceSequence[2 * numericValue - (idx + 1)];
    const constructedSequence = generatePermutation(initialNumericString, numericValue, currentMask, secondPartCharResolver);
    finalAccumulator += (permutationFrequencies[constructedSequence] || 0);
});

console.log(finalAccumulator);
