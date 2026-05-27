const fs = require('fs');
const INITIAL_CLEANUP_PATTERN = /gg|hicken/g;
const EE_TEST_PATTERN = /ee/;
const EE_REPLACE_VALUE = "eAe";
const CC_TEST_PATTERN = /cc/;
const CC_REPLACE_VALUE = "cAc";
const SEGMENT_DELIMITER = "A";
const FINAL_CHAR_TO_CHECK = "e";
const EGG_RESULT = "egg";
const CHICKEN_RESULT = "chicken";

function applyRepeatedGlobalReplacement(textToProcess, testPattern, replacementValue) {
    let currentTextValue = textToProcess;
    const globalReplacePattern = new RegExp(testPattern.source, 'g');

    while (testPattern.test(currentTextValue)) {
        currentTextValue = currentTextValue.replace(globalReplacePattern, replacementValue);
    }
    return currentTextValue;
}

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const trimmedInput = rawInputData.trim();

let intermediateString = trimmedInput.replace(INITIAL_CLEANUP_PATTERN, "");

intermediateString = applyRepeatedGlobalReplacement(intermediateString, EE_TEST_PATTERN, EE_REPLACE_VALUE);
intermediateString = applyRepeatedGlobalReplacement(intermediateString, CC_TEST_PATTERN, CC_REPLACE_VALUE);

const textSegments = intermediateString.split(SEGMENT_DELIMITER);

let currentLongestLength = 0;
let finalChosenSegment = "";

for (const segmentCandidate of textSegments) {
    const candidateLength = segmentCandidate.length;
    if (candidateLength > currentLongestLength) {
        currentLongestLength = candidateLength;
        finalChosenSegment = segmentCandidate;
    }
}

const lastCharOfLongest = finalChosenSegment.slice(-1);
const outputMessage = (lastCharOfLongest === FINAL_CHAR_TO_CHECK) ? EGG_RESULT : CHICKEN_RESULT;

console.log(outputMessage);
