const determinePopulationDeviation = (numberSequence) => {
    const elementCount = numberSequence.length;

    if (elementCount === 0) {
        return 0.0;
    }

    const sumTotal = numberSequence.reduce((total, num) => total + num, 0);
    const centralTendency = sumTotal / elementCount;

    const totalSquaredDeviations = numberSequence.reduce((sumOfSquares, num) => {
        const deviation = num - centralTendency;
        return sumOfSquares + (deviation * deviation);
    }, 0);

    const populationVariance = totalSquaredDeviations / elementCount;

    return Math.sqrt(populationVariance);
};

const processNumericalCollections = (sourceDataStream) => {
    const dataSegments = sourceDataStream.split('\n');

    const processNextSegment = (remainingSegments, collectedResults) => {
        if (remainingSegments.length < 2) {
            return collectedResults;
        }

        const countText = remainingSegments[0];
        if (countText === '0') {
            return collectedResults;
        }

        const numericQuantity = Number(countText);
        const sequenceText = remainingSegments[1];
        const currentSequence = sequenceText.split(' ').map(Number);

        const blockDeviation = determinePopulationDeviation(currentSequence);
        const formattedOutcome = blockDeviation.toFixed(4);

        return processNextSegment(
            remainingSegments.slice(2),
            [...collectedResults, formattedOutcome]
        );
    };

    const finalOutcomes = processNextSegment(dataSegments, []);
    finalOutcomes.forEach(outcome => console.log(outcome));
};

processNumericalCollections(require('fs').readFileSync('/dev/stdin', 'utf8'));