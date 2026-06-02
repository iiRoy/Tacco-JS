process.stdin.resume();
process.stdin.setEncoding('utf8');

const deriveRectangularMetrics = (firstDimension, secondDimension) => {
    const sumOfDimensions = [firstDimension, secondDimension].reduce((total, current) => total + current, 0);

    return {
        surfaceArea: firstDimension * secondDimension,
        boundaryLength: 2 * sumOfDimensions
    };
};

process.stdin.on('data', (incomingDataChunk) => {
    const numericSegments = incomingDataChunk.match(/(\d+)\s+(\d+)/);

    let primaryValue, secondaryValue;

    if (numericSegments && numericSegments.length >= 3) {
        primaryValue = Number.parseInt(numericSegments[1], 10);
        secondaryValue = Number.parseInt(numericSegments[2], 10);
    } else {
        const dataParts = incomingDataChunk.split(' ');
        primaryValue = Number.parseInt(dataParts[0], 10);
        secondaryValue = Number.parseInt(dataParts[1], 10);
    }

    const calculatedProperties = deriveRectangularMetrics(primaryValue, secondaryValue);

    console.log(`${calculatedProperties.surfaceArea} ${calculatedProperties.boundaryLength}`);
});
