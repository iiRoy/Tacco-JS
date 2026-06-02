var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

function processPatternReduction(inputStr, patternRegex, replacementStr) {
    let currentWorkingString = inputStr;
    while (patternRegex.test(currentWorkingString)) {
        currentWorkingString = currentWorkingString.replace(patternRegex, replacementStr);
    }
    return currentWorkingString;
}

let trimmedInput = rawData.trim();
let tokenizedContent = trimmedInput.replace(/egg/g, "E").replace(/chicken/g, "C");

let afterEReduction = processPatternReduction(tokenizedContent, /EE/, "EAE");
let fullyProcessedString = processPatternReduction(afterEReduction, /CC/, "CAC");

let contentSegments = fullyProcessedString.split("A");

let longestFoundSegment = "";
let currentMaxLength = 0;

for (const segmentItem of contentSegments) {
    const segmentItemLength = segmentItem.length;
    if (segmentItemLength > currentMaxLength) {
        longestFoundSegment = segmentItem;
        currentMaxLength = segmentItemLength;
    }
}

let finalDiscriminatorChar = longestFoundSegment.slice(-1);
let outputMessage;

if (finalDiscriminatorChar === "E") {
    outputMessage = "egg";
} else {
    outputMessage = "chicken";
}

console.log(outputMessage);
