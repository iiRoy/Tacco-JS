'use strict';

// Constants for modular arithmetic
const MOD_VALUE = 1000000007;

// Function to compute (base^exponent) % MOD_VALUE
function computeModularExponentiation(baseOperand, exponentOperand) {
    let resultAccumulator = 1;
    baseOperand %= MOD_VALUE;
    while (exponentOperand > 0) {
        if (exponentOperand % 2 === 1) {
            resultAccumulator = (resultAccumulator * baseOperand) % MOD_VALUE;
        }
        baseOperand = (baseOperand * baseOperand) % MOD_VALUE;
        exponentOperand = Math.floor(exponentOperand / 2);
    }
    return resultAccumulator;
}

// Function to find modular multiplicative inverse using Fermat's Little Theorem
function obtainModularInverse(numberToInvert) {
    return computeModularExponentiation(numberToInvert, MOD_VALUE - 2);
}

// Pre-calculate inverses for common divisors
const INVERSE_OF_TWO = obtainModularInverse(2);
const INVERSE_OF_SIX = obtainModularInverse(6);

(function(inputData) {
    // Parse input: extract numbers using regex and map to Number
    const numericPattern = /-?\d+/g;
    const extractedNumbers = [...inputData.matchAll(numericPattern)].map(match => Number(match[0]));

    const firstInputNumber = extractedNumbers[0];
    const secondInputNumber = extractedNumbers[1];
    const kParameter = extractedNumbers[2];

    // Determine min and max values from the first two inputs
    const minDimension = Math.min(firstInputNumber, secondInputNumber);
    const maxDimension = Math.max(firstInputNumber, secondInputNumber);

    let accumulatedResult = 0;
    const loopUpperBoundary = minDimension + maxDimension - 2;

    // Iterate through possible 'd' values, combining the original three loops
    for (let currentIterationValue = 1; currentIterationValue <= loopUpperBoundary; currentIterationValue++) {
        let alphaTerm, betaTerm, gammaTerm, deltaTerm;

        if (currentIterationValue < minDimension) {
            // Logic corresponding to original loop 1 (d from 1 to N-1)
            alphaTerm = (currentIterationValue * (currentIterationValue + 1)) % MOD_VALUE * (currentIterationValue + 2) % MOD_VALUE * INVERSE_OF_TWO % MOD_VALUE;

            let betaFactorComponent = (minDimension - currentIterationValue - 1 + MOD_VALUE) % MOD_VALUE;
            betaFactorComponent = (betaFactorComponent + (maxDimension - currentIterationValue - 1 + MOD_VALUE) % MOD_VALUE) % MOD_VALUE;
            betaTerm = betaFactorComponent * (currentIterationValue + 1) % MOD_VALUE * (currentIterationValue + 2) % MOD_VALUE * INVERSE_OF_TWO % MOD_VALUE;

            gammaTerm = (minDimension - currentIterationValue - 1 + MOD_VALUE) % MOD_VALUE * (maxDimension - currentIterationValue - 1 + MOD_VALUE) % MOD_VALUE * (currentIterationValue + 1) % MOD_VALUE;

            deltaTerm = (minDimension - currentIterationValue + MOD_VALUE) % MOD_VALUE;
            deltaTerm = (deltaTerm + (maxDimension - currentIterationValue + MOD_VALUE) % MOD_VALUE) % MOD_VALUE;
        } else if (currentIterationValue < maxDimension) {
            // Logic corresponding to original loop 2 (d from N to M-1)
            alphaTerm = minDimension * (minDimension + 1) % MOD_VALUE * (minDimension + 2) % MOD_VALUE * INVERSE_OF_SIX % MOD_VALUE;

            let betaFactorComponent = (maxDimension - currentIterationValue - 1 + MOD_VALUE) % MOD_VALUE;
            betaTerm = betaFactorComponent * minDimension % MOD_VALUE * (minDimension + 1) % MOD_VALUE * INVERSE_OF_TWO % MOD_VALUE;

            gammaTerm = 0;

            deltaTerm = (maxDimension - currentIterationValue + MOD_VALUE) % MOD_VALUE;
        } else {
            // Logic corresponding to original loop 3 (d from M to N+M-2)
            let a_variable = (minDimension + maxDimension - 1 - currentIterationValue + MOD_VALUE) % MOD_VALUE;
            alphaTerm = a_variable * (a_variable + 1) % MOD_VALUE * (a_variable + 2) % MOD_VALUE * INVERSE_OF_SIX % MOD_VALUE;

            betaTerm = 0;
            gammaTerm = 0;
            deltaTerm = 0;
        }

        let combinedInnerExpression = (alphaTerm + betaTerm + gammaTerm) % MOD_VALUE;
        combinedInnerExpression = (combinedInnerExpression * 2) % MOD_VALUE;
        combinedInnerExpression = (combinedInnerExpression - deltaTerm + MOD_VALUE) % MOD_VALUE; // Ensure positive result

        accumulatedResult = (accumulatedResult + currentIterationValue * combinedInnerExpression) % MOD_VALUE;
    }

    // Final multiplication and division using functional reduce
    let constantMultiplier = (minDimension * maxDimension - 2 - kParameter + MOD_VALUE) % MOD_VALUE;
    let finalComputedAnswer = accumulatedResult;

    if (kParameter - 2 > 0) {
        finalComputedAnswer = Array.from({ length: kParameter - 2 }, (_, index) => index)
            .reduce((currentAccumulator, currentLoopIndex) => {
                currentAccumulator = (currentAccumulator * constantMultiplier) % MOD_VALUE;
                const inverseOfDivisor = obtainModularInverse(currentLoopIndex + 1);
                currentAccumulator = (currentAccumulator * inverseOfDivisor) % MOD_VALUE;
                return currentAccumulator;
            }, finalComputedAnswer);
    }

    console.log(finalComputedAnswer);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
