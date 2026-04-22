function performTask(operationFunction) {
    let collectedInput = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataBuffer) => {
        collectedInput += dataBuffer;
    });

    process.stdin.on('end', () => {
        const numericalSequence = collectedInput
            .split(/\s+/)
            .filter(str => str.trim().length > 0)
            .map(Number);

        const finalResult = operationFunction(numericalSequence);
        process.stdout.write(finalResult);
    });
}

function analyzePath(dataPoints) {
    const pointCount = dataPoints[0];
    const pathNodes = [0, ...dataPoints.slice(1, pointCount + 1), 0];

    const totalJourneyLength = pathNodes.slice(0, -1).reduce((sum, currentCoord, index) => {
        const nextCoord = pathNodes[index + 1];
        return sum + Math.abs(currentCoord - nextCoord);
    }, 0);

    const computedValues = Array.from({ length: pointCount }).map((_, segmentIndex) => {
        const startNode = pathNodes[segmentIndex];
        const middleNode = pathNodes[segmentIndex + 1];
        const endNode = pathNodes[segmentIndex + 2];

        const twoSegmentLength = Math.abs(startNode - middleNode) + Math.abs(middleNode - endNode);
        const directSegmentLength = Math.abs(startNode - endNode);

        return totalJourneyLength - twoSegmentLength + directSegmentLength;
    });

    return computedValues.join(os.EOL);
}

var os = require('os');
performTask(analyzePath);