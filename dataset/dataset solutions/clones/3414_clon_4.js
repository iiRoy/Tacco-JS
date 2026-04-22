let aggregateData = '';
process.stdin.on('data', function (chunk) {
    aggregateData += chunk;
});

process.stdin.on('end', function () {
    processInputAndCompute(aggregateData);
});

function processInputAndCompute(inputPayload) {
    const partitions = inputPayload.split('\n').filter(line => line.trim() !== '');

    if (partitions.length === 0) {
        console.log(-1);
        return;
    }

    const setupTokens = partitions[0].split(' ');
    const spanLength = Number(setupTokens[1]); 

    const valueRecords = partitions.slice(1);

    const sortedMeasures = valueRecords
        .map(entry => parseInt(entry, 10))
        .sort((first, second) => first - second);

    if (sortedMeasures.length < spanLength) {
        console.log(-1);
        return;
    }

    const initialPositions = Array.from({ length: sortedMeasures.length - spanLength + 1 }, (_, index) => index);

    const calculatedOutcome = initialPositions.reduce((currentOptimal, currentPosition) => {
        const terminalPosition = currentPosition + spanLength - 1;
        const rangeMetric = sortedMeasures[terminalPosition] - sortedMeasures[currentPosition];
        return Math.min(currentOptimal, rangeMetric);
    }, Infinity);

    console.log(calculatedOutcome);
}