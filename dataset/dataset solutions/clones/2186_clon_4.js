function retrieveAbsoluteValue(value) {
    return value < 0 ? -value : value;
}

function computeFlooredQuotient(param1, param2) {
    let rawDividend = parseFloat(param1);
    let rawDivisor = parseFloat(param2);

    if (Number.isNaN(rawDividend) || Number.isNaN(rawDivisor)) {
        return Number.NaN;
    }

    if (rawDivisor === 0) {
        if (rawDividend === 0) return Number.NaN;
        return rawDividend > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }

    if (rawDividend === 0) return 0;

    let negativeResultFlag = (rawDividend < 0) !== (rawDivisor < 0);

    let absoluteDividend = retrieveAbsoluteValue(rawDividend);
    let absoluteDivisor = retrieveAbsoluteValue(rawDivisor);

    let currentQuotientCount = 0;
    let accumulatedSum = 0;

    const comparisonEpsilon = 1e-12; 

    while ((accumulatedSum + absoluteDivisor) <= absoluteDividend + comparisonEpsilon) {
        accumulatedSum += absoluteDivisor;
        currentQuotientCount++;
    }

    let finalResult = currentQuotientCount;

    if (negativeResultFlag) {
        finalResult = -finalResult;
        if (absoluteDividend - accumulatedSum > comparisonEpsilon) {
            finalResult--;
        }
    }

    return finalResult;
}

const inputArguments = process.argv.slice(2);
const firstVal = inputArguments[0];
const secondVal = inputArguments[1];

console.log(computeFlooredQuotient(firstVal, secondVal));