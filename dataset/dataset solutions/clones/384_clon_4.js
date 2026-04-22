let currentBuffer = '';

process.stdin.on('data', segment => {
    currentBuffer += segment;
});

process.stdin.on('end', () => {
    const allLines = currentBuffer.trim().split('\n');
    const totalCasesCount = Number(allLines.shift());

    const compiledResults = [];

    const calculateSequence = (initialValue, finalValue, pathCollector, strategyIdentifier) => {
        pathCollector.push(initialValue);
        if (initialValue === finalValue) {
            return pathCollector;
        }

        let nextIterationValue;
        if (strategyIdentifier === 'advance') {
            nextIterationValue = initialValue + 1;
        } else if (strategyIdentifier === 'recede') {
            nextIterationValue = initialValue - 1;
        } else { // strategyIdentifier === 'loop'
            nextIterationValue = (initialValue === 10) ? 5 : initialValue + 1;
        }
        return calculateSequence(nextIterationValue, finalValue, pathCollector, strategyIdentifier);
    };

    const determinePath = (entryPoint, exitPoint) => {
        if (entryPoint === exitPoint) {
            return [entryPoint];
        }

        let chosenStrategy;
        if (entryPoint < exitPoint) {
            chosenStrategy = 'advance';
        } else if (entryPoint > exitPoint && entryPoint <= 5) {
            chosenStrategy = 'recede';
        } else { // entryPoint > exitPoint && entryPoint > 5
            chosenStrategy = 'loop';
        }

        return calculateSequence(entryPoint, exitPoint, [], chosenStrategy);
    };

    allLines.forEach(lineEntry => {
        const [startPoint, endPoint] = lineEntry.split(' ').map(Number);
        const generatedPath = determinePath(startPoint, endPoint);
        compiledResults.push(generatedPath.join(' '));
    });

    process.stdout.write(compiledResults.join('\n') + '\n');
});