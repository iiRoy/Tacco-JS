let fullInputAccumulator = '';
global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

global.process.stdin.on('data', (dataChunk) => {
    fullInputAccumulator += dataChunk;
});

global.process.stdin.on('end', () => {
    commenceAnalysis(fullInputAccumulator);
});

const renderOutcome = (valueToDisplay) => {
    global.console.log(valueToDisplay);
};

const commenceAnalysis = (rawSourceContent) => {
    const numericalTokens = rawSourceContent
        .split(/\s+/)
        .filter(strVal => strVal.length > 0)
        .map(Number);

    const allComputedResults = performIterativeDecomposition(numericalTokens);

    allComputedResults.forEach(renderOutcome);
};

const performIterativeDecomposition = (inputDataSeries) => {
    if (inputDataSeries.length <= 1) {
        return [];
    }

    const currentBlockDimension = inputDataSeries[0];
    const activeSegment = inputDataSeries.slice(1, 1 + currentBlockDimension);
    const subsequentDataSeries = inputDataSeries.slice(1 + currentBlockDimension);

    if (currentBlockDimension === 0) {
        return performIterativeDecomposition(subsequentDataSeries);
    }

    let calculatedMean;
    if (activeSegment.length < 3) {
        calculatedMean = Number.NaN;
    } else {
        const orderedElements = [...activeSegment].sort((valA, valB) => valA - valB);
        const filteredCore = orderedElements.slice(1, orderedElements.length - 1);

        const cumulativeValue = filteredCore.reduce((aggregate, element) => aggregate + element, 0);

        calculatedMean = Math.round(cumulativeValue / filteredCore.length);
    }

    return [calculatedMean, ...performIterativeDecomposition(subsequentDataSeries)];
};