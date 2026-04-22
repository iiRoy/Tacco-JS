const acquiredData = require('node:fs').readFileSync(0, 'utf8');
const dataSegments = acquiredData.trim().split('\n');

const broadness = Number(dataSegments[0]);
const swapCount = Number(dataSegments[1]);

const exchangeInstructions = dataSegments.slice(2).map(segment => {
    const parts = segment.split(',');
    return [Number(parts[0]), Number(parts[1])];
});

const terminalPositions = Array.from({ length: broadness + 1 }, (_, idx) => idx);

for (const operation of exchangeInstructions) {
    const [leftMarker, rightMarker] = operation;
    const temporaryValue = terminalPositions[leftMarker];
    terminalPositions[leftMarker] = terminalPositions[rightMarker];
    terminalPositions[rightMarker] = temporaryValue;
}

console.log(terminalPositions.slice(1).join('\n'));