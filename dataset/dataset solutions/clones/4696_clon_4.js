'use strict';

const obtainValue = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedNumber = Number.parseInt(obtainValue.trim(), 10);

const largePrime = BigInt(1000000007);

const computeFactorialModulo = (limitValue, primeModulus) => {
    const calculateProductInternal = (currentNumber, accumulator) => {
        if (currentNumber > limitValue) {
            return accumulator;
        }
        const nextAccumulator = (accumulator * BigInt(currentNumber)) % primeModulus;
        return calculateProductInternal(currentNumber + 1, nextAccumulator);
    };

    return calculateProductInternal(1, BigInt(1));
};

const finalComputation = computeFactorialModulo(processedNumber, largePrime);

process.stdout.write(String(finalComputation) + '\n');