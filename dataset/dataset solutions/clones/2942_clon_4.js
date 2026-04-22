'use strict';
(function(sourceData){
    const processInputElements = (dataString) => {
        const numericElements = dataString.trim().split(/\s+/).map(Number);
        const [primary, secondary, tertiary] = numericElements;
        const dimensionOne = Math.min(primary, secondary);
        const dimensionTwo = Math.max(primary, secondary);
        const iterationCount = tertiary;
        return { dimensionOne, dimensionTwo, iterationCount };
    };

    const MODULUS_PRIME = 1000000007;
    const ensureMod = (val) => (val % MODULUS_PRIME + MODULUS_PRIME) % MODULUS_PRIME;
    const addMod = (a, b) => ensureMod(a + b);
    const subtractMod = (a, b) => ensureMod(a - b);
    const multiplyMod = (a, b) => ensureMod(a * b);

    const modularExponentiation = (base, exponent) => {
        let outcome = 1;
        base = ensureMod(base);
        while (exponent > 0) {
            if (exponent % 2 === 1) outcome = multiplyMod(outcome, base);
            base = multiplyMod(base, base);
            exponent = Math.floor(exponent / 2);
        }
        return outcome;
    };

    const obtainModularInverse = (numberValue) => modularExponentiation(numberValue, MODULUS_PRIME - 2);

    const INV_TWO_MOD = obtainModularInverse(2);
    const INV_SIX_MOD = obtainModularInverse(6);

    // Helper functions for polynomial terms A, B, C, D in each segment
    const calculateTermOneSegmentA = (d_val) =>
        multiplyMod(INV_SIX_MOD, multiplyMod(d_val + 1, multiplyMod(d_val + 2, d_val + 3)));

    const calculateTermOneSegmentB = (d_val, dim1, dim2) =>
        multiplyMod(addMod(subtractMod(dim1, d_val + 1), subtractMod(dim2, d_val + 1)),
                    multiplyMod(INV_TWO_MOD, multiplyMod(d_val + 1, d_val + 2)));

    const calculateTermOneSegmentC = (d_val, dim1, dim2) =>
        multiplyMod(subtractMod(dim1, d_val + 1), multiplyMod(subtractMod(dim2, d_val + 1), d_val + 1));

    const calculateTermOneSegmentD = (d_val, dim1, dim2) =>
        addMod(multiplyMod(subtractMod(dim1, d_val), dim2), multiplyMod(subtractMod(dim2, d_val), dim1));

    const determineSegmentOneContribution = (d_val, dim1, dim2) => {
        const termA = calculateTermOneSegmentA(d_val);
        const termB = calculateTermOneSegmentB(d_val, dim1, dim2);
        const termC = calculateTermOneSegmentC(d_val, dim1, dim2);
        const termD = calculateTermOneSegmentD(d_val, dim1, dim2);
        const sumABC_doubled = multiplyMod(addMod(termA, addMod(termB, termC)), 2);
        return multiplyMod(d_val, subtractMod(sumABC_doubled, termD));
    };

    const calculateTermTwoSegmentA = (dim1) =>
        multiplyMod(INV_SIX_MOD, multiplyMod(dim1, multiplyMod(dim1 + 1, dim1 + 2)));

    const calculateTermTwoSegmentB = (d_val, dim1, dim2) =>
        multiplyMod(subtractMod(dim2, d_val + 1),
                    multiplyMod(INV_TWO_MOD, multiplyMod(dim1, dim1 + 1)));

    const calculateTermTwoSegmentD = (d_val, dim1) =>
        multiplyMod(subtractMod(dim2, d_val), dim1);

    const determineSegmentTwoContribution = (d_val, dim1, dim2) => {
        const termA = calculateTermTwoSegmentA(dim1);
        const termB = calculateTermTwoSegmentB(d_val, dim1, dim2);
        const termC = 0;
        const termD = calculateTermTwoSegmentD(d_val, dim1);
        const sumABC_doubled = multiplyMod(addMod(termA, addMod(termB, termC)), 2);
        return multiplyMod(d_val, subtractMod(sumABC_doubled, termD));
    };

    const calculateTermThreeSegmentA = (d_val, dim1, dim2) => {
        const alias_a = subtractMod(addMod(dim1, dim2), d_val + 1);
        return multiplyMod(INV_SIX_MOD, multiplyMod(alias_a, multiplyMod(alias_a + 1, alias_a + 2)));
    };

    const determineSegmentThreeContribution = (d_val, dim1, dim2) => {
        const termA = calculateTermThreeSegmentA(d_val, dim1, dim2);
        const termB = 0;
        const termC = 0;
        const termD = 0;
        const sumABC_doubled = multiplyMod(addMod(termA, addMod(termB, termC)), 2);
        return multiplyMod(d_val, subtractMod(sumABC_doubled, termD));
    };

    // Generic sum function using Array.from and reduce
    const accumulateRange = (startPoint, endPoint, contributionFunction, dim1, dim2) => {
        if (startPoint > endPoint) return 0;
        return Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index)
                    .reduce((total, current_d) => addMod(total, contributionFunction(current_d, dim1, dim2)), 0);
    };

    // Factorial-like product for numerator of combinations
    const computePermutationNumerator = (totalItems, selectedItems) => {
        if (selectedItems <= 0) return 1;
        if (selectedItems > totalItems) return 0;
        return Array.from({ length: selectedItems }, (_, idx) => totalItems - idx)
                    .reduce((product, currentVal) => multiplyMod(product, currentVal), 1);
    };

    // Factorial for denominator of combinations
    const computeFactorial = (numberForFactorial) => {
        if (numberForFactorial <= 0) return 1;
        return Array.from({ length: numberForFactorial }, (_, idx) => idx + 1)
                    .reduce((product, currentVal) => multiplyMod(product, currentVal), 1);
    };

    // Main execution block
    const { dimensionOne, dimensionTwo, iterationCount } = processInputElements(sourceData);

    let primarySumResult = 0;

    // First segment sum: d from 1 to N-1
    primarySumResult = addMod(primarySumResult,
                              accumulateRange(1, dimensionOne - 1, determineSegmentOneContribution, dimensionOne, dimensionTwo));

    // Second segment sum: d from N to M-1
    primarySumResult = addMod(primarySumResult,
                              accumulateRange(dimensionOne, dimensionTwo - 1, determineSegmentTwoContribution, dimensionOne, dimensionTwo));

    // Third segment sum: d from M to N+M-2
    primarySumResult = addMod(primarySumResult,
                              accumulateRange(dimensionTwo, dimensionOne + dimensionTwo - 2, determineSegmentThreeContribution, dimensionOne, dimensionTwo));

    // Combinatorial part: (N*M-2) C (K-2)
    const totalPossibleCells = multiplyMod(dimensionOne, dimensionTwo);
    const elementsToChoose = iterationCount - 2;

    let finalCombinatorialMultiplier = 1;
    if (elementsToChoose >= 0) {
        const numeratorProduct = computePermutationNumerator(totalPossibleCells - 2, elementsToChoose);
        const denominatorFactorial = computeFactorial(elementsToChoose);
        const inverseDenominator = obtainModularInverse(denominatorFactorial);
        finalCombinatorialMultiplier = multiplyMod(numeratorProduct, inverseDenominator);
    }

    // Large number multiplication handling (mimicking original's precision logic for ans * F)
    const LARGE_NUMBER_SPLIT_BASE = 100000;
    const initialSumHighComponent = Math.floor(primarySumResult / LARGE_NUMBER_SPLIT_BASE);
    const initialSumLowComponent = primarySumResult % LARGE_NUMBER_SPLIT_BASE;

    let totalResultHigh = multiplyMod(multiplyMod(initialSumHighComponent, LARGE_NUMBER_SPLIT_BASE), finalCombinatorialMultiplier);
    let totalResultLow = multiplyMod(initialSumLowComponent, finalCombinatorialMultiplier);

    let overallFinalResult = addMod(totalResultHigh, totalResultLow);

    console.log(overallFinalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));