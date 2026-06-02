const fileSystemModule = require('fs');

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData.trim().split("\n");

const primaryString = processedLines[0];
const patternToSearch = processedLines[1];

const patternLengthAdjustment = patternToSearch.length - 1;

const globalSearchRegex = new RegExp(patternToSearch, "g");

const collectedMatchIndices = [];

while (globalSearchRegex.test(primaryString)) {
   const currentMatchEndPosition = globalSearchRegex.lastIndex;
   globalSearchRegex.lastIndex = currentMatchEndPosition - patternLengthAdjustment;
   collectedMatchIndices.push(globalSearchRegex.lastIndex - 1);
}

if (collectedMatchIndices.length > 0) {
   console.log(collectedMatchIndices.join("\n"));
}
