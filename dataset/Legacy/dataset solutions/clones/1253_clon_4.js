function processInputAndCompute(rawInputSegments) {
    const numericValues = rawInputSegments.map(Number);

    const elementCount = numericValues[0];
    const targetNumbers = numericValues.slice(1, elementCount + 1);

    const retrieveMinimum = (arr) => {
        if (arr.length === 0) {
            return Infinity;
        }
        return arr.reduce((accumulator, currentElement) => (currentElement < accumulator ? currentElement : accumulator));
    };

    const retrieveMaximum = (arr) => {
        if (arr.length === 0) {
            return -Infinity;
        }
        return arr.reduce((accumulator, currentElement) => (currentElement > accumulator ? currentElement : accumulator));
    };

    const computeSummation = (arr) => arr.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    const minimumResult = retrieveMinimum(targetNumbers);
    const maximumResult = retrieveMaximum(targetNumbers);
    const totalSum = computeSummation(targetNumbers);

    const finalResults = [minimumResult, maximumResult, totalSum];
    process.stdout.write(finalResults.join(' '));
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
    processInputAndCompute(dataChunk.split(/\s+/));
});
