const extractNumericSequence = (textualData) => {
    const contentLines = textualData.split('\n');
    const numericLine = contentLines[1];
    return numericLine.match(/-?\d+/g).map(Number);
};

const aggregateStatistics = (collectionOfNumbers) => {
    const initialAccumulator = { sumTotal: 0, quantity: 0 };
    return collectionOfNumbers.reduce((currentAggregate, currentNumber) => ({
        sumTotal: currentAggregate.sumTotal + currentNumber,
        quantity: currentAggregate.quantity + 1
    }), initialAccumulator);
};

const calculateRecursiveSumOfSquares = (centralPoint, numericalSeries, currentPosition = 0, runningSum = 0) => {
    if (currentPosition >= numericalSeries.length) {
        return runningSum;
    }
    const deviation = numericalSeries[currentPosition] - centralPoint;
    return calculateRecursiveSumOfSquares(centralPoint, numericalSeries, currentPosition + 1, runningSum + (deviation * deviation));
};

const ProcessInputAndCompute = (rawPayload) => {
    "use strict";

    const numericalValues = extractNumericSequence(rawPayload);
    const statistics = aggregateStatistics(numericalValues);

    const averageValue = statistics.sumTotal / statistics.quantity;

    const firstCandidate = Math.max(1, Math.min(100, Math.floor(averageValue)));
    const secondCandidate = Math.max(1, Math.min(100, Math.ceil(averageValue)));

    let minimumQuadraticSum = Infinity;

    const sumForFirst = calculateRecursiveSumOfSquares(firstCandidate, numericalValues);
    minimumQuadraticSum = Math.min(minimumQuadraticSum, sumForFirst);

    if (secondCandidate !== firstCandidate) {
        const sumForSecond = calculateRecursiveSumOfSquares(secondCandidate, numericalValues);
        minimumQuadraticSum = Math.min(minimumQuadraticSum, sumForSecond);
    }

    console.log(minimumQuadraticSum);
};

ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));