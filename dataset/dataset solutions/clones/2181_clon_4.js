const streamReader = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});
let inputLines = [];
streamReader.on('line', line => inputLines.push(line));
streamReader.on('close', () => {
    const dataParser = {
        source: inputLines,
        cursor: 0,
        length: inputLines.length,
        hasContent: function() { return this.cursor < this.length; },
        fetchNext: function() {
            if (this.hasContent()) { return this.source[this.cursor++]; }
            throw 'InputExhausted';
        },
        extractInteger: function(text) { return parseInt(text, 10); }
    };
    console.error('\n↑Input ↓Output');
    processComputation(dataParser);
});

function displayResult(value) { console.log(value); }

const zeroFreeCountCache = new Map();

function countDigitsWithoutZero(targetPosition, isTightLimit, isLeadingZero, limitString) {
    if (targetPosition === limitString.length) {
        return isLeadingZero ? 0 : 1;
    }

    const cacheKey = `${targetPosition}-${isTightLimit}-${isLeadingZero}`;
    if (zeroFreeCountCache.has(cacheKey)) {
        return zeroFreeCountCache.get(cacheKey);
    }

    let currentSum = 0;
    const maxDigit = isTightLimit ? parseInt(limitString[targetPosition], 10) : 9;

    for (let currentDigit = 0; currentDigit <= maxDigit; currentDigit++) {
        if (!isLeadingZero && currentDigit === 0) {
            continue;
        }

        currentSum += countDigitsWithoutZero(
            targetPosition + 1,
            isTightLimit && (currentDigit === maxDigit),
            isLeadingZero && (currentDigit === 0),
            limitString
        );
    }

    zeroFreeCountCache.set(cacheKey, currentSum);
    return currentSum;
}

function getZeroFreeNumbersUpTo(N) {
    if (N <= 0) return 0;
    zeroFreeCountCache.clear();
    const NString = N.toString();
    return countDigitsWithoutZero(0, true, true, NString);
}

function countHundredsMultiples(lowerBound, upperBound, groupSize) {
    if (groupSize !== 3) return 0;
    
    const actualLow = Math.max(lowerBound, 100);
    const actualHigh = Math.min(upperBound, 999);

    if (actualLow > actualHigh) return 0;

    let count = 0;
    for (let m = 100; m <= 900; m += 100) {
        if (m >= actualLow && m <= actualHigh) {
            count++;
        }
    }
    return count;
}

function subproblemSolver(totalDigitsInString, windowLength) {
    let subAccumulation = 0;
    
    const subWindowIndices = Array.from({ length: totalDigitsInString - windowLength + 1 }, (_, i) => i);

    subAccumulation = subWindowIndices.reduce((acc, subWindowStart) => {
        const rangeLower = Math.pow(10, windowLength - 1);
        const rangeUpper = Math.pow(10, windowLength) - 1;

        const currentRemainingLength = totalDigitsInString - (subWindowStart + windowLength);
        
        const zeroFree = getZeroFreeNumbersUpTo(rangeUpper) - getZeroFreeNumbersUpTo(rangeLower - 1);
        const totalNumbers = rangeUpper - rangeLower + 1;
        const withZero = totalNumbers - zeroFree;

        return acc + zeroFree * 1 + withZero * (9 * currentRemainingLength);

    }, 0);

    return subAccumulation;
}

function calculateRangeContribution(lowerBound, upperBound, currentGroupSize, remainingLength, isPrimaryCall) {
    let contribution = 0;

    const zeroFreeCount = getZeroFreeNumbersUpTo(upperBound) - getZeroFreeNumbersUpTo(lowerBound - 1);
    const totalNumbersInRange = upperBound - lowerBound + 1;
    let withZeroCount = totalNumbersInRange - zeroFreeCount;

    if (isPrimaryCall && currentGroupSize === 3) {
        const specialCaseCount = countHundredsMultiples(lowerBound, upperBound, currentGroupSize);
        
        contribution += specialCaseCount * subproblemSolver(remainingLength, currentGroupSize - 1);
        withZeroCount -= specialCaseCount;
    }

    contribution += zeroFreeCount * 1;
    contribution += withZeroCount * (9 * remainingLength);

    return contribution;
}

function processComputation(parser) {
    const inputString = parser.fetchNext();
    const desiredLength = parser.extractInteger(parser.fetchNext());
    let totalAccumulation = 0;
    
    const windowIndices = Array.from({ length: inputString.length - desiredLength + 1 }, (_, i) => i);

    totalAccumulation = windowIndices.reduce((accumulator, windowStart) => {
        let rangeUpperLimit;
        const rangeLowerLimit = Math.pow(10, desiredLength - 1);
        const currentRemainingLength = inputString.length - (windowStart + desiredLength);

        if (windowStart === 0) {
            rangeUpperLimit = parser.extractInteger(inputString.substring(0, desiredLength));
        } else {
            rangeUpperLimit = Math.pow(10, desiredLength) - 1;
        }
        
        return accumulator + calculateRangeContribution(
            rangeLowerLimit,
            rangeUpperLimit,
            desiredLength,
            currentRemainingLength,
            true
        );
    }, 0);

    displayResult(totalAccumulation);
}