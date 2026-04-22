'use strict';
const fileSystem = require('fs');

function createModularCalculator(primeModulus) {
    const factorialSeries = new Map();
    const inverseSeries = new Map();

    // Utility for (base^exponent) % modulus
    function performModularExponentiation(base, exponent) {
        let outcome = 1;
        base %= primeModulus;
        while (exponent > 0) {
            if (exponent % 2 === 1) outcome = (outcome * base) % primeModulus;
            base = (base * base) % primeModulus;
            exponent = Math.floor(exponent / 2);
        }
        return outcome;
    }

    // Modular multiplicative inverse using Fermat's Little Theorem (a^(m-2) % m)
    function retrieveModularInverse(number) {
        if (inverseSeries.has(number)) {
            return inverseSeries.get(number);
        }
        const inverted = performModularExponentiation(number, primeModulus - 2);
        inverseSeries.set(number, inverted);
        return inverted;
    }

    // Computes factorial (number!) % modulus with memoization
    function computeFactorialValue(number) {
        if (number < 0) return 0;
        if (number === 0) return 1;
        
        if (!factorialSeries.has(0)) factorialSeries.set(0, 1);
        if (!factorialSeries.has(1)) factorialSeries.set(1, 1);

        if (factorialSeries.has(number)) {
            return factorialSeries.get(number);
        }

        let currentProduct = 1;
        let startPoint = 1;

        // Find the largest pre-calculated factorial to continue from
        let maxCachedKey = 0;
        for (const key of factorialSeries.keys()) {
            if (key <= number && key > maxCachedKey) {
                maxCachedKey = key;
            }
        }
        if (maxCachedKey > 0) {
            currentProduct = factorialSeries.get(maxCachedKey);
            startPoint = maxCachedKey + 1;
        }
        
        for (let i = startPoint; i <= number; i++) {
            currentProduct = (currentProduct * i) % primeModulus;
            factorialSeries.set(i, currentProduct);
        }
        return currentProduct;
    }

    // Calculates binomial coefficient (nCk % m)
    function obtainBinomialCoefficient(nQuantity, kSelection) {
        if (kSelection < 0 || kSelection > nQuantity) return 0;
        if (kSelection === 0 || kSelection === nQuantity) return 1;
        if (kSelection > nQuantity / 2) kSelection = nQuantity - kSelection; // Optimization for symmetry

        const numeratorTerm = computeFactorialValue(nQuantity);
        const invDenominatorTerm1 = retrieveModularInverse(computeFactorialValue(kSelection));
        const invDenominatorTerm2 = retrieveModularInverse(computeFactorialValue(nQuantity - kSelection));

        // Result = (n! * (k!)^-1 * ((n-k)!)^-1) % m
        return (((numeratorTerm * invDenominatorTerm1) % primeModulus) * invDenominatorTerm2) % primeModulus;
    }

    return {
        obtainBinomialCoefficient: obtainBinomialCoefficient
    };
}

// Core logic to determine grid path count
function calculateGridTraversalWays(initialXCoord, initialYCoord) {
    const FIXED_MODULO_VALUE = 1000000007; // Equivalent to 10^9 + 7
    const arithOperator = createModularCalculator(FIXED_MODULO_VALUE);

    if ((initialXCoord + initialYCoord) % 3 !== 0) {
        return 0;
    }

    const firstDirectionSteps = (2 * initialYCoord - initialXCoord) / 3;
    const secondDirectionSteps = (2 * initialXCoord - initialYCoord) / 3;

    if (firstDirectionSteps < 0 || secondDirectionSteps < 0) {
        return 0;
    }
    
    // The problem asks for combinations of total steps (firstDirectionSteps + secondDirectionSteps)
    // choosing firstDirectionSteps steps of one type.
    return arithOperator.obtainBinomialCoefficient(firstDirectionSteps + secondDirectionSteps, firstDirectionSteps);
}

// Program entry point and input handling
function beginProgramExecution(rawInputData) {
    const inputSegments = rawInputData.split(/\s+/);
    let valueA = parseInt(inputSegments[0], 10);
    let valueB = parseInt(inputSegments[1], 10);
    console.log(calculateGridTraversalWays(valueA, valueB));
}

// Read standard input and start the process
beginProgramExecution(fileSystem.readFileSync('/dev/stdin', 'utf8'));