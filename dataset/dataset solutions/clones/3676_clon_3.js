const STDIN_FILE_DESCRIPTOR = 0;

let inputContentLines;
try {
    inputContentLines = String(require("fs").readFileSync(STDIN_FILE_DESCRIPTOR)).split('\n');
} catch (readError) {
    console.error("Input processing error: Unable to read from STDIN.", readError.message);
    process.exit(1);
}

const sequenceLength = parseInt(inputContentLines[0], 10);
const baseSequenceString = inputContentLines[1];

const permutationCounts = {};
let totalCountAccumulator = 0;

for (let permutationMask = (1 << sequenceLength) - 1; permutationMask >= 0; permutationMask--) {
    let currentPermutationString = "";

    for (let charProcessingIndex = sequenceLength - 1; charProcessingIndex >= 0; charProcessingIndex--) {
        const charToInclude = baseSequenceString[charProcessingIndex];

        if ((permutationMask & (1 << charProcessingIndex)) !== 0) {
            currentPermutationString = charToInclude + currentPermutationString;
        } else {
            currentPermutationString = currentPermutationString + charToInclude;
        }
    }

    permutationCounts[currentPermutationString] = (permutationCounts[currentPermutationString] || 0) + 1;
}

for (let comparisonMask = (1 << sequenceLength) - 1; comparisonMask >= 0; comparisonMask--) {
    let comparisonSequence = "";

    for (let reverseSequenceIndex = sequenceLength - 1; reverseSequenceIndex >= 0; reverseSequenceIndex--) {
        const conceptualCharacterIndex = (2 * sequenceLength) + (~reverseSequenceIndex);
        const charFromConceptualReversed = baseSequenceString[conceptualCharacterIndex];

        if ((comparisonMask & (1 << reverseSequenceIndex)) !== 0) {
            comparisonSequence = charFromConceptualReversed + comparisonSequence;
        } else {
            comparisonSequence = comparisonSequence + charFromConceptualReversed;
        }
    }

    totalCountAccumulator += (permutationCounts[comparisonSequence] || 0);
}

console.log(totalCountAccumulator);