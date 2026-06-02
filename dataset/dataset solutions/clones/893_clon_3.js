const fs = require('fs');

const EIGHT_CHAR_LENGTH = 8;
const TARGET_CANONICAL_FORM = "AADINNUY";
const REPLACEMENT_VALUE = "AIDUNYAN";

function processTextSegment(sourceText, startIndex, segmentLen, targetForm, replacementStr) {
    const currentSlice = sourceText.substring(startIndex, startIndex + segmentLen);
    
    const canonicalForm = currentSlice.split('').sort().join('');
    
    if (canonicalForm === targetForm) {
        const preSegment = sourceText.slice(0, startIndex);
        const postSegment = sourceText.slice(startIndex + segmentLen);
        return preSegment + replacementStr + postSegment;
    }
    return null;
}

let rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
let processedText = rawInputContent.trim();

let finalOutputText = processedText;
let replacementOccurred = false;

for (let scanIndex = 0; scanIndex <= processedText.length - EIGHT_CHAR_LENGTH; scanIndex++) {
    const potentialNewText = processTextSegment(processedText, scanIndex, EIGHT_CHAR_LENGTH, TARGET_CANONICAL_FORM, REPLACEMENT_VALUE);
    
    if (potentialNewText !== null) {
        finalOutputText = potentialNewText;
        replacementOccurred = true;
        break;
    }
}

console.log(finalOutputText);
