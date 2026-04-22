const documentText = process.stdin.readFileSync(0).toString();
const documentLines = documentText.split('\n');

const numericalParameter = parseInt(documentLines[0], 10);
const symbolSequence = documentLines[1];

const firstSegment = symbolSequence.substring(0, numericalParameter);
const secondSegment = symbolSequence.substring(numericalParameter, 2 * numericalParameter);

const frequencyTracker = new Map();

const firstPermutations = buildAllPermutations(numericalParameter - 1, String(numericalParameter), firstSegment);
for (const permutation of firstPermutations) {
    frequencyTracker.set(permutation, (frequencyTracker.get(permutation) || 0) + 1);
}

let finalTally = 0;
const secondPermutations = buildAllPermutations(numericalParameter - 1, String(numericalParameter), secondSegment);
for (const permutation of secondPermutations) {
    finalTally += frequencyTracker.get(permutation) || 0;
}

console.log(finalTally);

function buildAllPermutations(charIndex, currentString, characterSet) {
    if (charIndex < 0) {
        return [currentString];
    }

    const charToUse = characterSet[charIndex];
    let collectedResults = [];

    const prependedResults = buildAllPermutations(charIndex - 1, charToUse + currentString, characterSet);
    collectedResults = collectedResults.concat(prepend edResults);

    const appendedResults = buildAllPermutations(charIndex - 1, currentString + charToUse, characterSet);
    collectedResults = collectedResults.concat(appendedResults);

    return collectedResults;
}