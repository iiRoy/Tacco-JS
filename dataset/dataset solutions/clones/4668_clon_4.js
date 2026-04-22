const fileSystem = require('fs');
const dataStream = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const sourceNumber = parseInt(dataStream.shift(), 10);

const getIntegerFactors = (num) => {
    const potentialFactors = Array.from({ length: Math.floor(Math.sqrt(num)) }, (_, idx) => idx + 1);
    const uniqueFactors = potentialFactors.reduce((acc, current) => {
        if (num % current === 0) {
            acc.add(current);
            acc.add(num / current);
        }
        return acc;
    }, new Set());
    return Array.from(uniqueFactors).sort((a, b) => a - b);
};

const allDivisors = getIntegerFactors(sourceNumber);

const initialDigitCount = String(sourceNumber).length;

const finalResult = allDivisors.reduce((currentMin, factorA) => {
    const factorB = sourceNumber / factorA;
    const digitsA = String(factorA).length;
    const digitsB = String(factorB).length;
    const currentMaxDigits = Math.max(digitsA, digitsB);
    return Math.min(currentMin, currentMaxDigits);
}, initialDigitCount);

console.log(finalResult);