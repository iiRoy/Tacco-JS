const documentContent = require("fs").readFileSync("/dev/stdin", "utf8");

const lineSegments = documentContent.trim().split('\n');

const numericValues = lineSegments[0].match(/\d+/g).map(Number);

const zeroBasedAlterationIndex = numericValues[1] - 1;
const originalSequence = lineSegments[1];

const characterConversionTable = new Map([
    ['A', 'a'],
    ['B', 'b'],
    ['C', 'c']
]);

const characterToReplace = originalSequence.charAt(zeroBasedAlterationIndex);
const substituteCharacter = characterConversionTable.get(characterToReplace) || 'c';

const sequenceCharacters = Array.from(originalSequence);
sequenceCharacters[zeroBasedAlterationIndex] = substituteCharacter;

const modifiedSequence = sequenceCharacters.join('');

console.log(modifiedSequence);