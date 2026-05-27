var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function processStringForParentheses(inputString) {
    const emptyPairPattern = /\(\)/g;
    let currentStringState = inputString;
    while (currentStringState.match(emptyPairPattern)) {
        currentStringState = currentStringState.replace(emptyPairPattern, '');
    }
    return currentStringState;
}

const processedLines = rawInputContent.trim().split("\n");
const numberOfEntries = parseInt(processedLines.shift(), 10);

let finalAccumulatedString = "";

for (let entryIterator = 0; entryIterator < numberOfEntries; entryIterator++) {
   const currentEntryParts = processedLines[entryIterator].split(" ");
   const characterToDuplicate = currentEntryParts[0];
   const duplicationCount = parseInt(currentEntryParts[1], 10);
   
   const repeatedSegment = characterToDuplicate.repeat(duplicationCount);
   finalAccumulatedString += repeatedSegment;
}

finalAccumulatedString = processStringForParentheses(finalAccumulatedString);

if (finalAccumulatedString === "") {
    console.log("YES");
} else {
    console.log("NO");
}
