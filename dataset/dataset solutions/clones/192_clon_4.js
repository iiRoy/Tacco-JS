const fileSystemHandler = require('fs');
const rawContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const operationSequence = rawContent.trim().split('\n');

let currentBallLocation = 'A';

operationSequence.forEach(function(operationEntry) {
    const separationPoints = operationEntry.split(',');
    const firstContainer = separationPoints[0];
    const secondContainer = separationPoints[1];

    if (currentBallLocation === firstContainer) {
        currentBallLocation = secondContainer;
    } else if (currentBallLocation === secondContainer) {
        currentBallLocation = firstContainer;
    }
});

console.log(currentBallLocation);