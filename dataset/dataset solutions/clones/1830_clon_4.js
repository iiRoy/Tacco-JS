const fileAccessUtility = require('fs');

const systemInputPath = '/dev/stdin';

function extractPrimaryContent(sourcePath) {
    const fullContent = fileAccessUtility.readFileSync(sourcePath, 'utf8');
    const contentLines = fullContent.split('\n');
    return contentLines[0];
}

const subjectString = extractPrimaryContent(systemInputPath);

const allowedFirstPositions = new Set(['?', '|', 'P']);
const allowedSecondPositions = new Set(['?', '|', 'D']);

let transformedElements = [];
let currentPosition = 0;
const totalLength = subjectString.length;

while (currentPosition < totalLength) {
    const charA = subjectString[currentPosition];
    const charB = subjectString[currentPosition + 1];

    if (currentPosition + 1 < totalLength && allowedFirstPositions.has(charA) && allowedSecondPositions.has(charB)) {
        transformedElements.push('PD');
        currentPosition += 2;
    } else {
        transformedElements.push(charA);
        currentPosition += 1;
    }
}

const finalResultString = transformedElements.join('');

function presentOutcome(valueToDisplay) {
    console.log(valueToDisplay);
}

presentOutcome(finalResultString);