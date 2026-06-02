'use strict';
(function(inputTxt) {
    const processInput = (text) => {
        const numericValues = text.trim().split(/\s+/).map(Number);
        return {
            firstVal: numericValues[0],
            secondVal: numericValues[1],
            keyVal: numericValues[2]
        };
    };

    const { firstVal, secondVal, keyVal } = processInput(inputTxt);

    const smallerBound = Math.min(firstVal, secondVal);
    const largerBound = Math.max(firstVal, secondVal);

    const primeModulo = 1000000007;

    // Helper for modular multiplication to prevent intermediate overflow
    const performSafeModMultiplication = (operandA, operandB, modulus) => {
        const splitFactor = 100000; // Chosen to match original's implicit split
        let highA = Math.floor(operandA / splitFactor);
        let lowA = operandA % splitFactor;
        let highB = Math.floor(operandB / splitFactor);
        let lowB = operandB % splitFactor;

        let result = (lowA * lowB) % modulus;
        result = (result + (lowA * highB) % modulus * splitFactor) % modulus;
        result = (result + (highA * lowB) % modulus * splitFactor) % modulus;
        result = (result + (highA * highB) % modulus * splitFactor % modulus * splitFactor) % modulus;
        return result;
    };

    // Helper to compute C(n, k) * k! (falling factorial)
    // Original code uses (x+1)(x+2)(x+3)/6 which is C(x+3, 3)
    // and (x+1)(x+2)/2 which is C(x+2, 2)
    const getFallingFactorialTerm = (n, k) => {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k === 1) return n;
        if (k === 2) return n * (n - 1) / 2;
        if (k === 3) return n * (n - 1) * (n - 2) / 6;
        return 0; // For this problem, k is always 2 or 3.
    };

    let cumulativeSum = 0;

    // Core Summation Logic: Single loop with conditional logic inside
    // This replaces the three distinct for loops in the original.
    for (let currentIteration = 1; currentIteration <= smallerBound + largerBound - 2; currentIteration++) {
        let componentX = 0;
        let componentY = 0;
        let componentZ = 0;
        let componentW = 0;

        if (currentIteration < smallerBound) {
            componentX = getFallingFactorialTerm(currentIteration + 3, 3);
            componentY = (smallerBound - currentIteration - 1 + largerBound - currentIteration - 1) * getFallingFactorialTerm(currentIteration + 2, 2);
            componentZ = (smallerBound - currentIteration - 1) * (largerBound - currentIteration - 1) * (currentIteration + 1);
            componentW = (smallerBound - currentIteration) * largerBound + (largerBound - currentIteration) * smallerBound;
        } else if (currentIteration < largerBound) {
            componentX = getFallingFactorialTerm(smallerBound + 2, 3);
            componentY = (largerBound - currentIteration - 1) * getFallingFactorialTerm(smallerBound + 1, 2);
            // componentZ remains 0
            componentW = (largerBound - currentIteration) * smallerBound;
        } else {
            let tempCalcVar = smallerBound + largerBound - 1 - currentIteration;
            componentX = getFallingFactorialTerm(tempCalcVar + 2, 3);
            // componentY, componentZ, componentW remain 0
        }

        let currentIterationTerm = currentIteration * (performSafeModMultiplication(2, (componentX + componentY + componentZ), primeModulo) - componentW);
        cumulativeSum = (cumulativeSum + currentIterationTerm) % primeModulo;
    }

    cumulativeSum = (cumulativeSum + primeModulo) % primeModulo; // Ensure positive result

    // Numerator part of combinations: P(N*M-2, K-2)
    // Using a functional approach with Array.from and reduce
    if (keyVal > 1) {
        cumulativeSum = Array.from({ length: keyVal - 2 }, (_, index) => largerBound * smallerBound - 2 - index)
            .reduce((accumulator, value) => performSafeModMultiplication(accumulator, value, primeModulo), cumulativeSum);
    }

    // Denominator part: (K-2)! modulo K (as per original code's specific behavior)
    let factorialResult = 1;
    if (keyVal > 1) {
        for (let i = 1; i <= keyVal - 2; i++) {
            factorialResult = (factorialResult * i) % keyVal;
        }
    }

    // Extended Euclidean Algorithm for Modular Multiplicative Inverse
    // Rewritten iteratively with different variable names and structure
    const computeModularInverse = (numberToInvert, modulusValue) => {
        // Replicating original code's behavior for numberToInvert = 0: returns 1.
        // This is mathematically incorrect for inverse, but matches original's execution path.
        if (numberToInvert === 0) {
            return 1;
        }

        let currentMod = modulusValue;
        let currentNum = numberToInvert;
        let prevCoeffX = 1;
        let currCoeffX = 0;

        while (currentNum !== 0) {
            let quotient = Math.floor(currentMod / currentNum);
            let remainder = currentMod % currentNum;

            currentMod = currentNum;
            currentNum = remainder;

            let nextCoeffX = prevCoeffX - quotient * currCoeffX;
            prevCoeffX = currCoeffX;
            currCoeffX = nextCoeffX;
        }
        return (prevCoeffX % modulusValue + modulusValue) % modulusValue;
    };

    const inverseFactor = computeModularInverse(factorialResult, primeModulo);

    // Final multiplication with modular inverse
    cumulativeSum = performSafeModMultiplication(cumulativeSum, inverseFactor, primeModulo);
    cumulativeSum = (cumulativeSum + primeModulo) % primeModulo; // Ensure final result is positive

    console.log(cumulativeSum);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
