const dataExtractor = require('node:fs');

const rawInput = dataExtractor.readFileSync('/dev/stdin', 'utf8');
const numericSeries = rawInput.trim().split('\n').map(item => +item);

const performSummation = (itemsToAggregate) => {
    return itemsToAggregate.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
};

const processSegmentsRecursively = (seriesBuffer, currentPoint) => {
    if (currentPoint >= seriesBuffer.length) {
        return; // End of buffer reached
    }

    const segmentHeader = seriesBuffer[currentPoint];
    const itemQuantity = segmentHeader / 4;

    if (itemQuantity === 0) {
        return; // Termination signal encountered
    }

    const startPositionOfItems = currentPoint + 1;
    const endPositionOfItems = startPositionOfItems + itemQuantity;

    const segmentItems = seriesBuffer.slice(startPositionOfItems, endPositionOfItems);
    const segmentTotal = performSummation(segmentItems);

    console.log(segmentTotal);

    processSegmentsRecursively(seriesBuffer, endPositionOfItems);
};

processSegmentsRecursively(numericSeries, 0);