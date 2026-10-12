const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.split('\n');
const numStrings = inputLines.shift().split(' ');
const firstVal = parseInt(numStrings[0], 10);
const secondVal = parseInt(numStrings[1], 10);

const obtainDivisors = (num) => {
    if (num === 0) return [];
    if (num === 1) return [1];

    const limit = Math.floor(Math.sqrt(num));
    const initialDivisors = Array.from({ length: limit }, (_, idx) => idx + 1)
        .reduce((accumulator, currentFactor) => {
            if (num % currentFactor === 0) {
                accumulator.push(currentFactor);
                if (currentFactor * currentFactor !== num) {
                    accumulator.push(num / currentFactor);
                }
            }
            return accumulator;
        }, []);
    return initialDivisors.sort((valA, valB) => valA - valB);
};

const isNumberPrime = (num) => {
    if (num < 2) return false;
    if (num === 2 || num === 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let k = 5; k * k <= num; k += 6) {
        if (num % k === 0 || num % (k + 2) === 0) {
            return false;
        }
    }
    return true;
};

const computeGCD = (val1, val2) => {
    if (val2 === 0) {
        return val1;
    }
    return computeGCD(val2, val1 % val2);
};

const greatestCommonDivisorValue = computeGCD(firstVal, secondVal);
const allCommonDivisors = obtainDivisors(greatestCommonDivisorValue);

const resultCount = allCommonDivisors.reduce((accumulator, currentDivisor) => {
    if (currentDivisor === 1) {
        return accumulator;
    }
    return isNumberPrime(currentDivisor) ? accumulator + 1 : accumulator;
}, 1);

console.log(resultCount);
