'use strict';

((inputSource) => {
    const extractParameters = (rawText) => {
        const [firstSegment, secondSegment, ...remainder] = rawText.trim().split('\n');
        const quantityIdentifier = Number(firstSegment.split(/\s+/).pop());
        const numericCollection = secondSegment.split(/\s+/).filter(Boolean).map(Number);
        return { quantityIdentifier, numericCollection };
    };

    const { quantityIdentifier: currentWindowSize, numericCollection: numericSeries } = extractParameters(inputSource);

    const computeProgressiveTotals = (seriesData) => {
        if (seriesData.length === 0) return [];
        let runningAccumulator = 0;
        return seriesData.map(element => {
            runningAccumulator += element;
            return runningAccumulator;
        });
    };

    const progressiveSumList = computeProgressiveTotals(numericSeries);

    const deriveSlidingWindowSums = (originalCollection, progressiveSums, lengthOfWindow) => {
        const windowStartPositions = Array.from({ length: originalCollection.length - lengthOfWindow + 1 }, (_, positionIndex) => positionIndex);

        return windowStartPositions.map(startIdx => {
            const currentTotal = progressiveSums[startIdx + lengthOfWindow - 1] - (startIdx > 0 ? progressiveSums[startIdx - 1] : 0);
            return currentTotal;
        });
    };

    const slidingWindowAggregates = deriveSlidingWindowSums(numericSeries, progressiveSumList, currentWindowSize);

    const buildTriangleSequence = (limitValue) => {
        const sequenceElements = [0];
        Array.from({ length: limitValue }).reduce((priorSum, _, iterationIndex) => {
            const nextTerm = priorSum + (iterationIndex + 1);
            sequenceElements.push(nextTerm);
            return nextTerm;
        }, 0);
        return sequenceElements;
    };

    const triangularNumbersCollection = buildTriangleSequence(1000);

    console.log('hi');

})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));