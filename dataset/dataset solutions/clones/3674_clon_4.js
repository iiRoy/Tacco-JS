const inputLines = ("" + require("fs").readFileSync(0)).split('\n');
const segmentLength = +inputLines[0];
const sourceString = inputLines[1];

function* constructSequences(characterArray, currentPosition, leftAccumulator, rightAccumulator) {
    if (currentPosition === characterArray.length) {
        yield leftAccumulator + rightAccumulator;
        return;
    }

    const currentCharacter = characterArray[currentPosition];

    yield* constructSequences(characterArray, currentPosition + 1, leftAccumulator + currentCharacter, rightAccumulator);

    yield* constructSequences(characterArray, currentPosition + 1, leftAccumulator, currentCharacter + rightAccumulator);
}

const firstSegmentCharacters = Array.from(sourceString.substring(0, segmentLength));
const sequenceFrequencies = new Map();

for (const generatedSequence of constructSequences(firstSegmentCharacters, 0, "", "")) {
    sequenceFrequencies.set(generatedSequence, (sequenceFrequencies.get(generatedSequence) || 0) + 1);
}

const secondSegmentCharacters = Array.from(sourceString.substring(segmentLength, 2 * segmentLength));
let totalMatches = 0;

for (const generatedSequence of constructSequences(secondSegmentCharacters, 0, "", "")) {
    totalMatches += sequenceFrequencies.get(generatedSequence) || 0;
}

console.log(totalMatches);
