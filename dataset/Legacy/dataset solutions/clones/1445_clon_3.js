var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

function parseNumericSequence(sequenceString) {
    return sequenceString.split(" ").map(Number);
}

function computeStandardDeviation(valueArray, arrayLength) {
    const totalSum = valueArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const arithmeticMean = totalSum / arrayLength;

    let sumOfSquaredDeviations = 0;
    for (const individualValue of valueArray) {
        const deviation = individualValue - arithmeticMean;
        sumOfSquaredDeviations += Math.pow(deviation, 2);
    }

    const variance = sumOfSquaredDeviations / arrayLength;
    return Math.sqrt(variance);
}

while (true) {
    const count = parseInt(lines.shift(), 10);

    if (count === 0) {
        break;
    }

    const numbers = parseNumericSequence(lines.shift());

    const standardDeviation = computeStandardDeviation(numbers, count);

    console.log(standardDeviation.toFixed(8));
}
