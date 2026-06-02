function main(rawInputString) {
    const parseProblemSets = (sourceText) => {
        const segments = sourceText.split('\n');
        const collectedSets = [];
        let segmentIndex = 0;

        while (segmentIndex < segments.length) {
            const countIdentifier = segments[segmentIndex];
            if (countIdentifier === '0') {
                break;
            }

            const elementCount = parseInt(countIdentifier, 10);
            const dataLine = segments[segmentIndex + 1];
            const numericValues = dataLine.split(' ').map(Number);

            collectedSets.push({
                quantity: elementCount,
                measurements: numericValues
            });
            segmentIndex += 2;
        }
        return collectedSets;
    };

    const computePopulationStandardDeviation = (dataPoints) => {
        const dataSize = dataPoints.length;
        if (dataSize === 0) {
            return 0;
        }

        const sumOfElements = dataPoints.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
        const centralTendency = sumOfElements / dataSize;

        const sumOfSquaredDeviations = dataPoints.reduce((accumulator, currentVal) => {
            const deviation = currentVal - centralTendency;
            return accumulator + (deviation * deviation);
        }, 0);

        const variance = sumOfSquaredDeviations / dataSize;
        return Math.sqrt(variance);
    };

    const allProblemCases = parseProblemSets(rawInputString);

    allProblemCases.forEach(currentCase => {
        const calculatedDeviation = computePopulationStandardDeviation(currentCase.measurements);
        console.log(calculatedDeviation.toFixed(4));
    });
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
