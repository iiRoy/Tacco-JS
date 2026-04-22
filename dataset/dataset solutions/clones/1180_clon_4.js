const acquireStreamData = () => new Promise(resolver => {
    let collectedContent = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', portion => {
        collectedContent += portion;
    });
    process.stdin.on('end', () => {
        resolver(collectedContent);
    });
});

const deriveCentralValue = (numericSeries) => {
    const aggregate = numericSeries.reduce((acc, current) => acc + current, 0);
    return aggregate / numericSeries.length;
};

const calculateSpreadMetric = (numericSeries) => {
    const meanValue = deriveCentralValue(numericSeries);
    const sumOfSquaredDeviations = numericSeries.reduce((acc, current) => {
        const deviation = current - meanValue;
        return acc + (deviation * deviation);
    }, 0);
    return Math.sqrt(sumOfSquaredDeviations / numericSeries.length);
};

const processTextualEntries = (remainingSegments, outcomeCollection = []) => {
    if (remainingSegments.length < 2) {
        return outcomeCollection;
    }

    const firstSegment = remainingSegments[0];
    const secondSegment = remainingSegments[1];

    const elementCount = Number.parseInt(firstSegment, 10);

    if (elementCount === 0) {
        return outcomeCollection;
    }

    const numericalElements = secondSegment.split(' ').map(Number);

    const currentSpread = calculateSpreadMetric(numericalElements);

    return processTextualEntries(remainingSegments.slice(2), [...outcomeCollection, currentSpread]);
};

acquireStreamData().then(fullText => {
    const linesOfText = fullText.split('\n');
    const finalResults = processTextualEntries(linesOfText);
    console.log(finalResults.join('\n'));
});