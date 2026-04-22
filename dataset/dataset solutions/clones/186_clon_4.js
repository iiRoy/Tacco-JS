let collectedData = '';

process.stdin.on('data', (pieceOfData) => {
    collectedData += pieceOfData.toString('utf8');
});

process.stdin.on('end', () => {
    const parsedLines = collectedData.split('\n')
        .map(currentEntry => currentEntry.trim())
        .filter(cleanedEntry => cleanedEntry !== '');

    if (parsedLines.length === 0) {
        process.stdout.write('0\n');
        return;
    }

    const initialAccumulator = {
        maximumTransformed: -Infinity,
        minimumTransformed: Infinity,
        anyValidProcessed: false
    };

    const transformedExtremes = parsedLines.reduce((accumulator, stringRepresentation) => {
        const valueAsFloat = parseFloat(stringRepresentation);
        if (isNaN(valueAsFloat)) {
            return accumulator;
        }

        const segmentsOfValue = stringRepresentation.split('.');
        const countOfDecimalDigits = segmentsOfValue.length > 1 ? segmentsOfValue[1].length : 0;
        const scalingFactor = Math.pow(10, countOfDecimalDigits);
        const integerEquivalent = Math.round(valueAsFloat * scalingFactor);

        if (integerEquivalent > accumulator.maximumTransformed) {
            accumulator.maximumTransformed = integerEquivalent;
        }
        if (integerEquivalent < accumulator.minimumTransformed) {
            accumulator.minimumTransformed = integerEquivalent;
        }
        accumulator.anyValidProcessed = true;
        return accumulator;
    }, initialAccumulator);

    if (!transformedExtremes.anyValidProcessed) {
        process.stdout.write('0\n');
        return;
    }

    const finalCalculation = (transformedExtremes.maximumTransformed - transformedExtremes.minimumTransformed) / 10;
    process.stdout.write(finalCalculation.toString() + '\n');
});

process.stdin.on('error', (issue) => {
    process.stderr.write('Data acquisition issue: ' + issue.message + '\n');
    process.exit(1);
});