const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContent.trim().split("\n");

const TERMINATION_SEQUENCE = "0 0";
const GROUP_SIZE = 5;
const CATEGORY_LABELS = "ABCDE";

let currentSums = [];

function processAndOutputGroup(sumsCollection) {
    const maximumSum = sumsCollection.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue), -Infinity);
    const labelIndex = sumsCollection.indexOf(maximumSum);
    const correspondingLabel = CATEGORY_LABELS[labelIndex];
    console.log(`${correspondingLabel} ${maximumSum}`);
}

function parseLineAndCalculateSum(lineString) {
    const numberParts = lineString.split(" ").map(Number);
    return numberParts[0] + numberParts[1];
}

for (let lineIndex = 0; lineIndex < dataLines.length; lineIndex++) {
    const currentLine = dataLines[lineIndex];

    if (currentSums.length === 0 && currentLine === TERMINATION_SEQUENCE) {
        break;
    }

    if (currentSums.length === GROUP_SIZE) {
        processAndOutputGroup(currentSums);
        currentSums = [];
        lineIndex--; // Re-process the current line in the next iteration
    } else {
        const calculatedSum = parseLineAndCalculateSum(currentLine);
        currentSums.push(calculatedSum);
    }
}
