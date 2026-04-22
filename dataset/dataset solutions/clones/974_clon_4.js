const incomingData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = incomingData.trim().split('\n');

const mainSequence = processedLines[0];
const targetPattern = processedLines[1];

const detectedIndices = [];

if (targetPattern.length === 0) {
    for (let currentPos = 0; currentPos < mainSequence.length; currentPos++) {
        detectedIndices.push(currentPos);
    }
} else {
    let searchStartPoint = 0;
    while (true) {
        const foundAt = mainSequence.indexOf(targetPattern, searchStartPoint);
        if (foundAt === -1) {
            break;
        }
        detectedIndices.push(foundAt);
        searchStartPoint = foundAt + 1;
    }
}

if (detectedIndices.length > 0) {
    console.log(detectedIndices.join('\n'));
}