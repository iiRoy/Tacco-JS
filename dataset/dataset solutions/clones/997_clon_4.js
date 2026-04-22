((sourceData) => {
    const parsedValues = sourceData.trim().split('\n').map(Number);
    const elementCount = parsedValues.shift();
    const valueSequence = parsedValues.slice(0, elementCount);

    const ultimateResult = valueSequence.reduce((historicalMetrics, currentMeasure) => {
        const potentialImprovement = currentMeasure - historicalMetrics.minimumObservation;
        const currentOptimalYield = Math.max(historicalMetrics.optimalYield, potentialImprovement);
        const newMinimumObservation = Math.min(historicalMetrics.minimumObservation, currentMeasure);

        return { minimumObservation: newMinimumObservation, optimalYield: currentOptimalYield };
    }, { minimumObservation: Number.POSITIVE_INFINITY, optimalYield: Number.NEGATIVE_INFINITY });

    console.log(ultimateResult.optimalYield);
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));