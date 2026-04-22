const extractNumericSequence = (textualFragments) => {
    const numericalParts = textualFragments.map(Number);
    const countOfElements = numericalParts[0];
    return numericalParts.slice(1, 1 + countOfElements);
};

const deriveStatisticalMeasures = (numberCollection) => {
    if (numberCollection.length === 0) {
        return {
            minimumObservation: Infinity,
            maximumObservation: -Infinity,
            aggregateSum: 0
        };
    }

    return numberCollection.reduce((accumulator, currentDatum) => {
        accumulator.minimumObservation = Math.min(accumulator.minimumObservation, currentDatum);
        accumulator.maximumObservation = Math.max(accumulator.maximumObservation, currentDatum);
        accumulator.aggregateSum += currentDatum;
        return accumulator;
    }, { minimumObservation: Infinity, maximumObservation: -Infinity, aggregateSum: 0 });
};

const renderOutputString = (statisticalResults) => {
    return `${statisticalResults.minimumObservation} ${statisticalResults.maximumObservation} ${statisticalResults.aggregateSum}`;
};

const processIncomingBlock = (dataBlock) => {
    const rawSegments = dataBlock.split(/\s+/);
    const relevantNumbers = extractNumericSequence(rawSegments);
    const calculatedStats = deriveStatisticalMeasures(relevantNumbers);
    const finalDisplay = renderOutputString(calculatedStats);
    process.stdout.write(finalDisplay);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', processIncomingBlock);