function processInput(rawInput) {
    const dataLines = rawInput.split('\n');
    const elementCount = Number(dataLines[0]);
    const seriesA = dataLines[1].split(' ').map(Number);
    const seriesB = dataLines[2].split(' ').map(Number);

    const aggregatedMetrics = Array.from({ length: elementCount }, (_, index) => index).reduce((accumulator, currentIndex) => {
        const valueA = seriesA[currentIndex];
        const valueB = seriesB[currentIndex];

        accumulator.totalSumA += valueA;
        accumulator.totalSumB += valueB;
        accumulator.absoluteDiffAccumulator += Math.abs(valueA - valueB);
        accumulator.positiveDiffAccumulator += Math.max(0, valueB - valueA);
        accumulator.negativeDiffAccumulator += Math.max(0, valueA - valueB);
        return accumulator;
    }, {
        totalSumA: 0,
        totalSumB: 0,
        absoluteDiffAccumulator: 0,
        positiveDiffAccumulator: 0,
        negativeDiffAccumulator: 0
    });

    const { totalSumA, totalSumB, absoluteDiffAccumulator, positiveDiffAccumulator, negativeDiffAccumulator } = aggregatedMetrics;

    const overallDifference = totalSumB - totalSumA;

    const conditionAlpha = totalSumA <= totalSumB;
    const conditionBeta = absoluteDiffAccumulator <= overallDifference * 3;
    const conditionGamma = positiveDiffAccumulator <= overallDifference * 2;
    const conditionDelta = negativeDiffAccumulator <= overallDifference;
    const conditionEpsilon = positiveDiffAccumulator / negativeDiffAccumulator <= 2;

    const finalResult = conditionAlpha && conditionBeta && conditionGamma && conditionDelta && conditionEpsilon;

    console.log('%s', finalResult ? 'Yes' : 'No');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
