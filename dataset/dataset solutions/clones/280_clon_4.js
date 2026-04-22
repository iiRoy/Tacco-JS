const sourceMaterial = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const rawText = sourceMaterial.trim();

let processedSegments = [];
let currentSegment = "";
const textLength = rawText.length;

const boundaryCharacters = new Set([' ', '\t', '\n', '\r', '.', ',']);

for (let currentPosition = 0; currentPosition < textLength; currentPosition++) {
    const charAtPosition = rawText[currentPosition];

    if (boundaryCharacters.has(charAtPosition)) {
        if (currentSegment.length >= 3 && currentSegment.length <= 6) {
            processedSegments.push(currentSegment);
        }
        currentSegment = "";
    } else {
        currentSegment += charAtPosition;
    }
}

if (currentSegment.length >= 3 && currentSegment.length <= 6) {
    processedSegments.push(currentSegment);
}

const finalOutput = processedSegments.join(" ");

console.log(finalOutput);