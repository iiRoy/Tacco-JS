'use strict';
(function(rawInput){
    const MODULUS = Math.pow(10, 9) + 7;

    // --- Modular Arithmetic Utilities ---

    // Robust modular multiplication to prevent intermediate overflow for (a * b) % M
    // where a, b < M and M is large (M^2 > 2^53).
    const safeModMultiply = (factorA, factorB) => {
        factorA = (factorA % MODULUS + MODULUS) % MODULUS;
        factorB = (factorB % MODULUS + MODULUS) % MODULUS;
        let finalProduct = 0;
        while (factorB > 0) {
            if (factorB & 1) finalProduct = (finalProduct + factorA) % MODULUS;
            factorA = (factorA + factorA) % MODULUS;
            factorB >>= 1;
        }
        return finalProduct;
    };

    const modAddition = (valA, valB) => (valA + valB) % MODULUS;
    const modSubtraction = (valA, valB) => (valA - valB + MODULUS) % MODULUS;

    // Modular exponentiation (base^exp % MODULUS)
    const modPower = (baseVal, exponentVal) => {
        let result = 1;
        baseVal %= MODULUS;
        while (exponentVal > 0) {
            if (exponentVal % 2 === 1) result = safeModMultiply(result, baseVal);
            baseVal = safeModMultiply(baseVal, baseVal);
            exponentVal = Math.floor(exponentVal / 2);
        }
        return result;
    };

    // Modular multiplicative inverse using Fermat's Little Theorem (MODULUS must be prime)
    const getModInverse = (number) => modPower(number, MODULUS - 2);

    // Precompute inverses for common small denominators
    const inverseOfTwo = getModInverse(2);
    const inverseOfSix = getModInverse(6);

    // --- Input Parsing ---
    const { smallestValue, largestValue, targetCount } = (() => {
        const parsedNumbers = rawInput.trim().split(/\s+/).map(Number);
        return {
            smallestValue: Math.min(parsedNumbers[0], parsedNumbers[1]),
            largestValue: Math.max(parsedNumbers[0], parsedNumbers[1]),
            targetCount: parsedNumbers[2]
        };
    })();

    // --- Generator for Iteration Range ---
    function* generateIterationValues(minBound, maxBound) {
        for (let currentIter = 1; currentIter <= minBound + maxBound - 2; currentIter++) {
            yield currentIter;
        }
    }

    // --- Core Logic: Calculate Individual Term Contribution ---
    const computeSingleTerm = (currentIter, minBound, maxBound, inv2, inv6) => {
        let componentA = 0, componentB = 0, componentC = 0, componentD = 0;

        if (currentIter >= 1 && currentIter <= minBound - 1) {
            const factor1 = modAddition(currentIter, 1);
            const factor2 = modAddition(currentIter, 2);
            const factor3 = modAddition(currentIter, 3);
            componentA = safeModMultiply(safeModMultiply(safeModMultiply(factor1, factor2), factor3), inv6);

            const min_minus_iter_minus_1 = modSubtraction(minBound, modAddition(currentIter, 1));
            const max_minus_iter_minus_1 = modSubtraction(maxBound, modAddition(currentIter, 1));
            componentB = safeModMultiply(safeModMultiply(safeModMultiply(modAddition(min_minus_iter_minus_1, max_minus_iter_minus_1), factor1), factor2), inv2);
            componentC = safeModMultiply(safeModMultiply(min_minus_iter_minus_1, max_minus_iter_minus_1), factor1);

            const min_minus_iter = modSubtraction(minBound, currentIter);
            const max_minus_iter = modSubtraction(maxBound, currentIter);
            componentD = modAddition(safeModMultiply(min_minus_iter, maxBound), safeModMultiply(max_minus_iter, minBound));
        } else if (currentIter >= minBound && currentIter <= maxBound - 1) {
            const minFactor = minBound;
            const minFactorPlus1 = modAddition(minBound, 1);
            const minFactorPlus2 = modAddition(minBound, 2);
            componentA = safeModMultiply(safeModMultiply(safeModMultiply(minFactor, minFactorPlus1), minFactorPlus2), inv6);

            const max_minus_iter_minus_1 = modSubtraction(maxBound, modAddition(currentIter, 1));
            componentB = safeModMultiply(safeModMultiply(safeModMultiply(max_minus_iter_minus_1, minFactor), minFactorPlus1), inv2);
            componentC = 0;
            componentD = safeModMultiply(modSubtraction(maxBound, currentIter), minFactor);
        } else if (currentIter >= maxBound && currentIter <= minBound + maxBound - 2) {
            const adjustedValue = modSubtraction(modAddition(minBound, maxBound), modAddition(currentIter, 1));
            const adjFactor1 = adjustedValue;
            const adjFactor2 = modAddition(adjustedValue, 1);
            const adjFactor3 = modAddition(adjustedValue, 2);
            componentA = safeModMultiply(safeModMultiply(safeModMultiply(adjFactor1, adjFactor2), adjFactor3), inv6);
            componentB = 0;
            componentC = 0;
            componentD = 0;
        } else {
            return 0; // This branch should ideally not be reached with correct iteration bounds
        }

        let sumOfComponents = modAddition(componentA, componentB);
        sumOfComponents = modAddition(sumOfComponents, componentC);
        let doubledSum = safeModMultiply(sumOfComponents, 2);
        let finalInnerExpression = modSubtraction(doubledSum, componentD);
        return safeModMultiply(currentIter, finalInnerExpression);
    };

    let runningTotal = 0;
    for (const currentIterValue of generateIterationValues(smallestValue, largestValue)) {
        runningTotal = modAddition(runningTotal, computeSingleTerm(currentIterValue, smallestValue, largestValue, inverseOfTwo, inverseOfSix));
    }

    // --- Combinatorics Factor Calculation ---
    let combinationFactor = 1;
    const totalGridPoints = safeModMultiply(smallestValue, largestValue);
    const nForCombination = modSubtraction(totalGridPoints, 2); // N*M - 2
    const kForCombination = targetCount - 2;

    if (kForCombination >= 0) {
        for (let i = 0; i < kForCombination; i++) {
            combinationFactor = safeModMultiply(combinationFactor, modSubtraction(nForCombination, i));
            combinationFactor = safeModMultiply(combinationFactor, getModInverse(i + 1));
        }
    }
    // If kForCombination < 0 (i.e., targetCount < 2), the loop doesn't run,
    // and combinationFactor remains 1, which correctly handles cases like C(n,0)=1.

    runningTotal = safeModMultiply(runningTotal, combinationFactor);

    console.log(runningTotal);

})(require('fs').readFileSync('/dev/stdin','utf8'));
