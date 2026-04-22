function computationEngine(sourceText) {
    const inputAttributes = sourceText.trim().split(/\s+/);
    const scaleFactor = Number(inputAttributes[0]);
    const deductionAmount = Number(inputAttributes[1]);
    const startingPoint = Number(inputAttributes[2]);

    const calculateSeries = (currentValue, remainingIterations, accumulatedResults) => {
        if (remainingIterations === 0) {
            return accumulatedResults;
        }
        const nextValue = currentValue * scaleFactor - deductionAmount;
        return calculateSeries(nextValue, remainingIterations - 1, [...accumulatedResults, nextValue]);
    };

    const numericalSequence = calculateSeries(startingPoint, 10, []);
    const formattedResult = numericalSequence.join('\n');

    console.log(formattedResult);
    return formattedResult;
}