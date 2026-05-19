const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceData.split('\n');
const initialParameters = dataSegments.shift().split(' ');

const limitNumber = Number(initialParameters[0]);
const comparisonThreshold = Number(initialParameters[1]);

const determineMinimumPower = (initialValue, targetBoundary) => {
    if (initialValue >= targetBoundary) {
        return 0;
    }
    // Calculates 'c' such that initialValue * 2^c >= targetBoundary
    // This is equivalent to c >= log2(targetBoundary / initialValue)
    // We need the smallest integer c, so Math.ceil is used.
    // Math.log(x) / Math.log(2) is used for log base 2.
    return Math.ceil(Math.log(targetBoundary / initialValue) / Math.log(2));
};

const cumulativeProbability = Array.from({ length: limitNumber }, (_, index) => index + 1)
    .reduce((accumulator, currentIterationValue) => {
        const requiredExponent = determineMinimumPower(currentIterationValue, comparisonThreshold);
        // Original: (1 / N) * (1 / Math.pow(2, c))
        // Mathematically equivalent to: 1 / (N * Math.pow(2, c))
        return accumulator + (1 / (limitNumber * Math.pow(2, requiredExponent)));
    }, 0);

console.log(cumulativeProbability);
