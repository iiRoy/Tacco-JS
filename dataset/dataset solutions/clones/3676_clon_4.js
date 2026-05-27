const buildPermutedString = (charArray, bitmask) => {
    return charArray.reduceRight((accumulator, currentCharacter, index) => {
        return (bitmask & (1 << index)) ? currentCharacter + accumulator : accumulator + currentCharacter;
    }, '');
};

const rawInputContent = String(require("fs").readFileSync(0));
const parsedInputLines = rawInputContent.split('\n');

const sequenceLength = Number(parsedInputLines[0]);
const characterSequence = parsedInputLines[1];

const stringCountsMap = new Map();
let finalMatchSum = 0;

const firstPartCharacters = characterSequence.slice(0, sequenceLength).split('');
for (let currentBitmask = 0; currentBitmask < (1 << sequenceLength); currentBitmask++) {
    const constructedString = buildPermutedString(firstPartCharacters, currentBitmask);
    stringCountsMap.set(constructedString, (stringCountsMap.get(constructedString) || 0) + 1);
}

const secondPartCharacters = characterSequence.slice(sequenceLength, 2 * sequenceLength).split('');
for (let currentBitmask = 0; currentBitmask < (1 << sequenceLength); currentBitmask++) {
    const constructedString = buildPermutedString(secondPartCharacters, currentBitmask);
    finalMatchSum += (stringCountsMap.get(constructedString) || 0);
}

console.log(finalMatchSum);
