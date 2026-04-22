let inputAccumulator = '';

process.stdin.on('data', (dataChunk) => {
    inputAccumulator += dataChunk.toString();
});

process.stdin.on('end', () => {
    const processedLine = inputAccumulator.trim();
    const components = processedLine.split(' ');

    const primaryOperand = parseInt(components[0], 10);
    const secondaryOperand = parseInt(components[1], 10);

    const calculatedResult = (primaryOperand % secondaryOperand === 0)
        ? primaryOperand
        : secondaryOperand - 1;

    console.log(calculatedResult);
});

process.stdin.resume();