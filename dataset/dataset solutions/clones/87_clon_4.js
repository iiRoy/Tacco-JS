const obtainInputContent = () => require("fs").readFileSync("/dev/stdin", "utf8");

const constructPoint = (xCoordinate, yCoordinate) => ({ x: xCoordinate, y: yCoordinate });

const computeFormattedSlope = (initialPoint, terminalPoint) => {
    const verticalDisplacement = terminalPoint.y - initialPoint.y;
    const horizontalDisplacement = terminalPoint.x - initialPoint.x;
    return (verticalDisplacement / horizontalDisplacement).toFixed(6);
};

const processInputLines = (rawData) => {
    const dataSegments = rawData.split('\n');

    dataSegments.forEach(currentEntry => {
        const numericalElements = currentEntry.split(' ').map(Number);

        const firstSegmentOrigin = constructPoint(numericalElements[0], numericalElements[1]);
        const firstSegmentDestination = constructPoint(numericalElements[2], numericalElements[3]);
        const secondSegmentOrigin = constructPoint(numericalElements[4], numericalElements[5]);
        const secondSegmentDestination = constructPoint(numericalElements[6], numericalElements[7]);

        const firstSlopeRepresentation = computeFormattedSlope(firstSegmentOrigin, firstSegmentDestination);
        const secondSlopeRepresentation = computeFormattedSlope(secondSegmentOrigin, secondSegmentDestination);

        if (firstSlopeRepresentation === secondSlopeRepresentation) {
            console.log('YES');
        } else {
            console.log('NO');
        }
    });
};

processInputLines(obtainInputContent());
