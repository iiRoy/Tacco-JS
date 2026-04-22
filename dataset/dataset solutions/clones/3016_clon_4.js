const processNumericalSequence = (sourceData) => {
    const segments = sourceData.split('\n');
    const quantityIndicator = Number(segments[0]);
    const numericalRepresentations = segments[1].split(' ');

    const relevantNumbers = numericalRepresentations.slice(0, quantityIndicator).map(Number);

    const initialAccumulator = {
        totalAbsoluteValue: 0,
        negativeQuantity: 0,
        minimumAbsoluteValue: Infinity
    };

    const finalMetrics = relevantNumbers.reduce((currentStats, currentNumber) => {
        const absoluteOfCurrent = Math.abs(currentNumber);
        return {
            totalAbsoluteValue: currentStats.totalAbsoluteValue + absoluteOfCurrent,
            negativeQuantity: currentStats.negativeQuantity + (currentNumber < 0 ? 1 : 0),
            minimumAbsoluteValue: Math.min(currentStats.minimumAbsoluteValue, absoluteOfCurrent)
        };
    }, initialAccumulator);

    console.log(finalMetrics.negativeQuantity);

    if (finalMetrics.negativeQuantity % 2 === 0) {
        console.log(finalMetrics.totalAbsoluteValue);
    } else {
        console.log(finalMetrics.totalAbsoluteValue - finalMetrics.minimumAbsoluteValue);
    }
};

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));