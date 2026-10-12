const fileSystemModule = require('fs');

function evaluateStringBalance(inputSegment) {
    const irrelevantCharsPattern = /[a-zA-Z]|\.|\s/g;
    const bracketPairRemovalPattern = /\[\]|\(\)/g;

    let currentWorkingString = inputSegment.replace(irrelevantCharsPattern, "");

    let foundPairsInString = currentWorkingString.match(bracketPairRemovalPattern);
    while (foundPairsInString) {
        currentWorkingString = currentWorkingString.replace(bracketPairRemovalPattern, "");
        foundPairsInString = currentWorkingString.match(bracketPairRemovalPattern);
    }

    return currentWorkingString.length === 0;
}

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const cleanedInputData = rawInputData.trim();
const inputLineSegments = cleanedInputData.split("\n");

for (let segmentIndex = 0; segmentIndex < inputLineSegments.length; segmentIndex++) {
    const lineToProcess = inputLineSegments[segmentIndex];
    const isSegmentBalanced = evaluateStringBalance(lineToProcess);

    console.log(isSegmentBalanced ? "yes" : "no");
}
