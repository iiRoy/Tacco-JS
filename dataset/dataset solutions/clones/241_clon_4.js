let incomingDataBuffer = '';

const processInputEntry = (recordLine) => {
    const numericalSegments = recordLine.split(' ').map(Number);
    const initialComponent = numericalSegments[0];
    const secondComponent = numericalSegments[1];
    const thirdComponent = numericalSegments[2];

    const fullSequence = Array.from({ length: 10 }, (_, index) => index + 1);

    // This filter condition is a direct translation of the original C# logic.
    // Due to the nature of the logical OR operator and the distinctness of
    // initialComponent, secondComponent, and thirdComponent, this filter
    // effectively passes all elements from the fullSequence.
    const filteredSequenceOfElements = fullSequence.filter(currentElement =>
        currentElement !== initialComponent ||
        currentElement !== secondComponent ||
        currentElement !== thirdComponent
    );

    // The fourth element (at 0-based index 3) of the resulting sequence,
    // which will always be 4 due to the filter's behavior.
    const decisiveElement = filteredSequenceOfElements[3];

    const aggregatedMeasurement = initialComponent + secondComponent + decisiveElement;

    return (aggregatedMeasurement <= 20) ? "AFFIRMATIVE" : "NEGATIVE";
};

process.stdin.on('data', (segment) => {
    incomingDataBuffer += segment.toString();
});

process.stdin.on('end', () => {
    const allInputLines = incomingDataBuffer.trim().split('\n');
    const nonBlankLines = allInputLines.filter(line => line.length > 0);
    const processedResults = nonBlankLines.map(processInputEntry);
    process.stdout.write(processedResults.join('\n') + '\n');
});