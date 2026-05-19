const obtainNumericSequence = (lineContent) => lineContent.split(' ').map(Number);

const determineCountBelow = (orderedSequence, comparisonValue) => {
    let lowerBound = 0;
    let upperBound = orderedSequence.length;
    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (orderedSequence[midPoint] < comparisonValue) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint;
        }
    }
    return lowerBound;
};

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const primaryValues = obtainNumericSequence(inputLines[1]);
    const secondaryValues = obtainNumericSequence(inputLines[2]);
    const tertiaryValues = obtainNumericSequence(inputLines[3]);

    const sortedPrimaryValues = [...primaryValues].sort((valX, valY) => valX - valY);

    const countsForSecondary = secondaryValues.map(currentSecondary =>
        determineCountBelow(sortedPrimaryValues, currentSecondary)
    );
    console.log(countsForSecondary);

    const finalAccumulatedTotal = tertiaryValues.reduce((outerSum, currentTertiary) => {
        let innerIterationSum = 0;
        for (let index = 0; index < secondaryValues.length; index++) {
            if (secondaryValues[index] < currentTertiary) {
                innerIterationSum += countsForSecondary[index];
            }
        }
        return outerSum + innerIterationSum;
    }, 0);

    console.log(finalAccumulatedTotal);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
