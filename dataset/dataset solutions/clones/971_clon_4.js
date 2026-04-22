const fileSystem = require('fs');

const retrievedContent = fileSystem.readFileSync('/dev/stdin', { encoding: 'utf8' });

const extractedSegments = retrievedContent.trim().split('\n');
const sourceText = extractedSegments[0];
const targetPattern = extractedSegments[1];

let scanPosition = 0;
let matchLocation;

while ((matchLocation = sourceText.indexOf(targetPattern, scanPosition)) !== -1) {
    console.log(matchLocation);
    scanPosition = matchLocation + 1;
}