function containsNonHiSegments(textInput) {
    const segments = String(textInput).split('hi');
    for (const part of segments) {
        if (part.length > 0) {
            return true;
        }
    }
    return false;
}

function processInputData(sourceText) {
    const hasOtherContent = containsNonHiSegments(sourceText);

    const outcomeIndicator = hasOtherContent ? 'No' : 'Yes';

    console.log(outcomeIndicator);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
