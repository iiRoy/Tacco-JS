function processInputData(rawData) {
    const lineSegments = rawData.split('\n');

    const segmentCount = parseInt(lineSegments[0].split(' ')[0], 10);

    const pointPositions = lineSegments[1].trim().split(' ').map(val => Number(val)).sort((a, b) => a - b);

    const gapLengths = Array.from({ length: pointPositions.length - 1 }, (_, idx) => {
        return pointPositions[idx + 1] - pointPositions[idx];
    });

    gapLengths.sort((a, b) => a - b);

    const elementsToSum = pointPositions.length - segmentCount;

    let totalSum = 0;
    for (let k = 0; k < elementsToSum; k++) {
        totalSum += gapLengths[k];
    }

    console.log(totalSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
