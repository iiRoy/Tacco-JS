function checkPatternAt(sourceStr, patternStr, startPos) {
    const patternLength = patternStr.length;

    if (patternLength === 0) {
        return true;
    }

    for (let k = 0; k < patternLength; k++) {
        if (sourceStr[startPos + k] !== patternStr[k]) {
            return false;
        }
    }
    return true;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

const mainString = inputLines[0];
const searchPattern = inputLines[1];

const mainStringLength = mainString.length;

const foundIndices = [];

for (let mainIdx = 0; mainIdx < mainStringLength; mainIdx++) {
    if (checkPatternAt(mainString, searchPattern, mainIdx)) {
        foundIndices.push(mainIdx);
    }
}

if (foundIndices.length > 0) {
    console.log(foundIndices.join("\n"));
}
