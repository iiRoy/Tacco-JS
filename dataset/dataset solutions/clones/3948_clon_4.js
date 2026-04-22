const fileSystem = require('fs');

const extractData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataSegments = extractData.trim().split('\n');

const cityCount = Number(dataSegments[0]);
const originalPositions = dataSegments[1].split(' ').map(Number);

const journeyPoints = [0, ...originalPositions, 0];

const overallPathDistance = journeyPoints.reduce((accumulator, currentPoint, index, fullPath) => {
    if (index === 0) return 0;
    return accumulator + Math.abs(currentPoint - fullPath[index - 1]);
}, 0);

const individualSkipResults = Array.from({ length: cityCount }, (_, idx) => {
    const pointBefore = journeyPoints[idx];
    const pointToSkip = journeyPoints[idx + 1];
    const pointAfter = journeyPoints[idx + 2];

    const costRemoved = Math.abs(pointToSkip - pointBefore) + Math.abs(pointAfter - pointToSkip);
    const costAdded = Math.abs(pointBefore - pointAfter);

    return overallPathDistance - costRemoved + costAdded;
});

individualSkipResults.forEach(value => console.log(value));