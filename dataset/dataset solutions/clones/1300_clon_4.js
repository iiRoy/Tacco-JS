const readerInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let gatheredSegments = [];
readerInterface.on('line', (currentSegment) => {
    gatheredSegments.push(currentSegment);
});

readerInterface.on('close', () => {
    const [rowDimension, colDimension] = gatheredSegments[0].split(' ').map(Number);

    let columnAccumulators = Array.from({ length: colDimension + 1 }, () => 0);

    let computedRows = [];

    gatheredSegments.slice(1).forEach((dataString) => {
        const currentNumericalSet = dataString.split(' ').map(Number);
        let currentTotal = 0;

        const processedSet = currentNumericalSet.map((value, position) => {
            if (position < colDimension) {
                currentTotal += value;
                columnAccumulators[position] += value;
            }
            return value;
        });

        columnAccumulators[colDimension] += currentTotal;
        processedSet.push(currentTotal);

        computedRows.push(processedSet.join(' '));
    });

    computedRows.push(columnAccumulators.join(' '));
    console.log(computedRows.join('\n'));
});