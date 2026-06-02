var fileSystem = require('fs');
const INPUT_SOURCE_PATH = '/dev/stdin';

var rawInputContent = fileSystem.readFileSync(INPUT_SOURCE_PATH, 'utf8');
var trimmedContent = rawInputContent.trim();

const EGG_IDENTIFIER = "egg";
const CHICKEN_IDENTIFIER = "chicken";
const E_CHAR_CODE = "E";
const C_CHAR_CODE = "C";
const E_PAIR_TRANSFORM = "EAE";
const C_PAIR_TRANSFORM = "CAC";
const SEGMENT_SEPARATOR = "A";

var initialTransformation = trimmedContent.replace(new RegExp(EGG_IDENTIFIER, 'g'), E_CHAR_CODE)
                                         .replace(new RegExp(CHICKEN_IDENTIFIER, 'g'), C_CHAR_CODE);

function performIterativeReplacement(sourceText, searchRegex, replacementValue) {
    let currentTextState = sourceText;
    let hasChangedInIteration = true;
    while (hasChangedInIteration) {
        let nextTextState = currentTextState.replace(searchRegex, replacementValue);
        if (nextTextState === currentTextState) {
            hasChangedInIteration = false;
        } else {
            currentTextState = nextTextState;
        }
    }
    return currentTextState;
}

var afterEggPatternReduction = performIterativeReplacement(initialTransformation, /EE/, E_PAIR_TRANSFORM);
var finalProcessedSequence = performIterativeReplacement(afterEggPatternReduction, /CC/, C_PAIR_TRANSFORM);

var sequenceSegments = finalProcessedSequence.split(SEGMENT_SEPARATOR);

let longestSequencePart = "";
let maximumLengthEncountered = 0;

for (let segmentIndex = 0; segmentIndex < sequenceSegments.length; segmentIndex++) {
    let currentSegmentCandidate = sequenceSegments[segmentIndex];
    if (currentSegmentCandidate.length > maximumLengthEncountered) {
        longestSequencePart = currentSegmentCandidate;
        maximumLengthEncountered = currentSegmentCandidate.length;
    }
}

const lastCharacterOfLongestPart = longestSequencePart.slice(-1);
let finalDeterminedOutput;

if (lastCharacterOfLongestPart === E_CHAR_CODE) {
    finalDeterminedOutput = EGG_IDENTIFIER;
} else {
    finalDeterminedOutput = CHICKEN_IDENTIFIER;
}

console.log(finalDeterminedOutput);
