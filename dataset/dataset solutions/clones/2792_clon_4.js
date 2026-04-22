'use strict';

class NumericProcessor {
    static MOD_VALUE = 1000000007; // Prime modulus for all arithmetic operations
    static MAX_COMPUTATION_LIMIT; // Max 'n' value for combination precomputation
    static FACTORIAL_VALUES;
    static INVERSE_FACTORIAL_VALUES;

    // Computes (valA + valB) % MOD_VALUE
    static addModulo(valA, valB) {
        return (valA + valB) % NumericProcessor.MOD_VALUE;
    }

    // Computes (operandA * operandB) % MOD_VALUE using binary multiplication (Russian peasant method)
    static productModulo(operandA, operandB) {
        let currentTotal = 0;
        operandA %= NumericProcessor.MOD_VALUE;
        while (operandB > 0) {
            if (operandB & 1) { // If operandB is odd, add operandA to the total
                currentTotal = NumericProcessor.addModulo(currentTotal, operandA);
            }
            operandA = NumericProcessor.addModulo(operandA, operandA); // Double operandA
            operandB >>= 1; // Halve operandB
        }
        return currentTotal;
    }

    // Computes (baseVal ^ exponentVal) % MOD_VALUE using modular exponentiation
    static powerModulo(baseVal, exponentVal) {
        let result = 1;
        baseVal %= NumericProcessor.MOD_VALUE;
        while (exponentVal > 0) {
            if (exponentVal & 1) {
                result = NumericProcessor.productModulo(result, baseVal);
            }
            baseVal = NumericProcessor.productModulo(baseVal, baseVal);
            exponentVal >>= 1;
        }
        return result;
    }

    // Computes the modular multiplicative inverse of a number using Fermat's Little Theorem
    static modularReciprocal(numberVal) {
        return NumericProcessor.powerModulo(numberVal, NumericProcessor.MOD_VALUE - 2);
    }

    // Precomputes factorials and their modular inverses up to a given upper limit
    static prepareCombinatorics(upperLimit) {
        NumericProcessor.MAX_COMPUTATION_LIMIT = upperLimit;
        NumericProcessor.FACTORIAL_VALUES = new Array(upperLimit + 1);
        NumericProcessor.INVERSE_FACTORIAL_VALUES = new Array(upperLimit + 1);

        NumericProcessor.FACTORIAL_VALUES[0] = 1;
        NumericProcessor.INVERSE_FACTORIAL_VALUES[0] = 1;

        for (let idx = 1; idx <= upperLimit; idx++) {
            NumericProcessor.FACTORIAL_VALUES[idx] = NumericProcessor.productModulo(NumericProcessor.FACTORIAL_VALUES[idx - 1], idx);
        }
        
        // Compute the inverse of the largest factorial, then work backwards
        NumericProcessor.INVERSE_FACTORIAL_VALUES[upperLimit] = NumericProcessor.modularReciprocal(NumericProcessor.FACTORIAL_VALUES[upperLimit]);
        for (let idx = upperLimit - 1; idx >= 1; idx--) {
            NumericProcessor.INVERSE_FACTORIAL_VALUES[idx] = NumericProcessor.productModulo(NumericProcessor.INVERSE_FACTORIAL_VALUES[idx + 1], idx + 1);
        }
    }

    // Calculates C(totalItems, chosenItems) = n! / (k! * (n-k)!) % MOD_VALUE
    static retrieveCombination(totalItems, chosenItems) {
        if (chosenItems < 0 || chosenItems > totalItems) {
            return 0; // Invalid combination
        }
        if (chosenItems === 0 || chosenItems === totalItems) {
            return 1; // Base cases C(n,0) = C(n,n) = 1
        }
        // Optimization: C(n, k) = C(n, n-k)
        if (chosenItems > totalItems / 2) {
            chosenItems = totalItems - chosenItems;
        }
        
        // C(n, k) = n! * (k!)^(-1) * ((n-k)!)^(-1) % MOD_VALUE
        let termNFact = NumericProcessor.FACTORIAL_VALUES[totalItems];
        let termKInvFact = NumericProcessor.INVERSE_FACTORIAL_VALUES[chosenItems];
        let termNKInvFact = NumericProcessor.INVERSE_FACTORIAL_VALUES[totalItems - chosenItems];
        
        let tempResult = NumericProcessor.productModulo(termNFact, termKInvFact);
        return NumericProcessor.productModulo(tempResult, termNKInvFact);
    }
}

// Main execution context
(function(rawData) {
    const numericalParameters = String(rawData)
                          .trim()
                          .split(/\s+/)
                          .map(value => parseInt(value, 10));

    const totalElements = numericalParameters[0]; // Corresponds to N
    const selectionSize = numericalParameters[1]; // Corresponds to K

    // Initialize combinatorial precomputations up to N
    NumericProcessor.prepareCombinatorics(totalElements);

    // Calculate L = N - K + 1
    const adjustedTotalElements = totalElements - selectionSize + 1;

    // Generate results using a functional array mapping approach
    const collectedOutputs = Array.from({ length: selectionSize }, (_, index) => {
        const iterationIndex = index + 1; // Corresponds to 'i' from 1 to K
        
        // Calculate C(L, i) * C(K-1, i-1) % MOD_VALUE
        const firstTerm = NumericProcessor.retrieveCombination(adjustedTotalElements, iterationIndex);
        const secondTerm = NumericProcessor.retrieveCombination(selectionSize - 1, iterationIndex - 1);
        
        return NumericProcessor.productModulo(firstTerm, secondTerm);
    });

    console.log(collectedOutputs.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));