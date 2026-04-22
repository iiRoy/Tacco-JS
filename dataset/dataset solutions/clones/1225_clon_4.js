const entrance = require('readline');

const ioHandler = entrance.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

ioHandler.on('line', (lineContent) => {
    const measureValues = lineContent.split(' ').map(val => +val);

    const zoneWidth = measureValues[0];
    const zoneHeight = measureValues[1];
    const objectX = measureValues[2];
    const objectY = measureValues[3];
    const objectRadius = measureValues[4];

    const outcome = (() => {
        const leftBoundary = objectX - objectRadius;
        const rightBoundary = objectX + objectRadius;
        const topBoundary = objectY - objectRadius;
        const bottomBoundary = objectY + objectRadius;

        if (leftBoundary < 0) {
            return 'No';
        }
        if (rightBoundary > zoneWidth) {
            return 'No';
        }
        if (topBoundary > 0) {
            return 'No';
        }
        if (bottomBoundary < zoneHeight) {
            return 'No';
        }
        return 'Yes';
    })();

    console.log(outcome);
});