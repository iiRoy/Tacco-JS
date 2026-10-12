const checkYearForLeap = (yr) => (yr % 400 === 0) || (yr % 4 === 0 && yr % 100 !== 0);

const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceData.split('\n');

const finalOutputBuffer = [];
let lineCursor = 0;

while (true) {
    const currentLine = dataSegments[lineCursor++];
    const yearBounds = currentLine.split(' ').map(Number);
    const startBoundary = yearBounds[0];
    const endBoundary = yearBounds[1];

    if (startBoundary + endBoundary === 0) {
        break;
    }

    const rangeLength = endBoundary - startBoundary + 1;
    const rangeYears = Array.from({ length: rangeLength > 0 ? rangeLength : 0 }, (_, index) => startBoundary + index);
    const foundLeapYears = rangeYears.filter(checkYearForLeap);

    const segmentResult = foundLeapYears.length > 0 ? foundLeapYears.join('\n') + '\n' : 'NA\n';
    finalOutputBuffer.push(segmentResult);
}

console.log(finalOutputBuffer.join('\n\n'));
