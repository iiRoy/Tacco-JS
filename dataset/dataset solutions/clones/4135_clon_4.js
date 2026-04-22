function retrieveDigitSum(numericValue) {
    let currentSummation = 0;
    let temporaryNumber = numericValue;
    while (temporaryNumber > 0) {
        currentSummation += temporaryNumber % 10;
        temporaryNumber = Math.floor(temporaryNumber / 10);
    }
    return currentSummation;
}

function calculateSpecialSum(sourceData) {
    const [maximumValue, lowerBoundInclusive, upperBoundInclusive] = sourceData[0].split(' ').map(Number);

    const resultantSum = Array.from({ length: maximumValue }, (_, index) => index + 1)
        .filter(numberToEvaluate => {
            const digitAggregation = retrieveDigitSum(numberToEvaluate);
            return digitAggregation >= lowerBoundInclusive && digitAggregation <= upperBoundInclusive;
        })
        .reduce((accumulatedTotal, currentNumber) => accumulatedTotal + currentNumber, 0);

    console.log(resultantSum);
}

calculateSpecialSum(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));