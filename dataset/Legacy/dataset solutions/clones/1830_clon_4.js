const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const primaryString = sourceData[0];

function checkFirstChar(charValue) {
    return charValue === 'P' || charValue === '?';
}

function checkSecondChar(charValue) {
    return charValue === 'D' || charValue === '?';
}

const matchLocations = [];
let currentScanPosition = 0;
const stringLength = primaryString.length;

while (currentScanPosition < stringLength - 1) {
    const charA = primaryString[currentScanPosition];
    const charB = primaryString[currentScanPosition + 1];

    if (checkFirstChar(charA) && checkSecondChar(charB)) {
        matchLocations.push([currentScanPosition, currentScanPosition + 1]);
        currentScanPosition += 2;
    } else {
        currentScanPosition += 1;
    }
}

let processedOutput = '';
let lastAppendedPosition = 0;

for (let i = 0; i < matchLocations.length; i++) {
    const currentMatchPair = matchLocations[i];
    const matchStartIdx = currentMatchPair[0];
    const matchEndIdx = currentMatchPair[1];

    processedOutput += primaryString.substring(lastAppendedPosition, matchStartIdx);
    processedOutput += 'PD';
    lastAppendedPosition = matchEndIdx + 1;
}

processedOutput += primaryString.substring(lastAppendedPosition);

console.log(processedOutput);
