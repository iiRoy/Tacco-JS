(function() {
    const rawSourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

    const segmentManifest = rawSourceText.split('\n')
                                         .map(chunk => chunk.trim())
                                         .filter(chunk => chunk.length > 0);

    const itemCount = parseInt(segmentManifest[0], 10);
    const upperBound = parseInt(segmentManifest[1], 10);
    const numericSeries = segmentManifest[2].split(' ').map(Number);

    const evaluateSequenceRecursively = (currentPosition, runningTotal, valueContainer, comparisonLimit) => {
        if (currentPosition >= valueContainer.length) {
            return runningTotal;
        }

        const currentValue = valueContainer[currentPosition];
        const optionAlpha = currentValue;
        const optionBeta = comparisonLimit - currentValue;
        const minimalChoice = Math.min(optionAlpha, optionBeta);

        return evaluateSequenceRecursively(currentPosition + 1, runningTotal + (minimalChoice * 2), valueContainer, comparisonLimit);
    };

    const computedOutcome = evaluateSequenceRecursively(0, 0, numericSeries, upperBound);
    console.log(computedOutcome);
})();