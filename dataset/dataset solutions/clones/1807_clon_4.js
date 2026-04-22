const processInputAndCompute = (entireDataSet) => {
    const segmentedLines = entireDataSet.trim().split('\n');
    const quantityToConsider = parseInt(segmentedLines[0], 10);
    const itemRepresentations = segmentedLines[1].split(' ');

    const finalValue = itemRepresentations
        .slice(0, quantityToConsider)
        .reduce((currentAccumulator, currentItemRepresentation) => currentAccumulator * Number(currentItemRepresentation), 1);

    return finalValue;
};

let capturedStream = '';

process.stdin.on('data', (dataChunk) => {
    capturedStream += dataChunk.toString();
});

process.stdin.on('end', () => {
    const calculatedResult = processInputAndCompute(capturedStream);
    process.stdout.write(String(calculatedResult) + '\n');
});