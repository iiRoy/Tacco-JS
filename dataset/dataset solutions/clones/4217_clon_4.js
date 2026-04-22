'use strict'

const performCalculation = (inputString) => {
    const limitValue = Number(inputString);
    const capValue = Number.MAX_SAFE_INTEGER;
    const factor = 1000000;

    const memo = new Map();

    // Recursive function to compute the sequence value at a given index.
    // It returns an object containing:
    //   - 'storedRepresentation': The value that would be stored in the original array after potential scaling.
    //   - 'originalSumValue': The raw sum of the two preceding 'storedRepresentation' values, before scaling.
    const obtainValue = (idx) => {
        if (memo.has(idx)) {
            return memo.get(idx);
        }

        let currentResult;
        if (idx === 0) {
            currentResult = { storedRepresentation: 2, originalSumValue: 2 };
        } else if (idx === 1) {
            currentResult = { storedRepresentation: 1, originalSumValue: 1 };
        } else {
            const previousTwoTerms = obtainValue(idx - 2);
            const previousOneTerm = obtainValue(idx - 1);

            const evaluatedSum = previousTwoTerms.storedRepresentation + previousOneTerm.storedRepresentation;
            let valueToStore;

            if (evaluatedSum <= capValue) {
                valueToStore = evaluatedSum;
            } else {
                valueToStore = evaluatedSum / factor;
            }
            currentResult = { storedRepresentation: valueToStore, originalSumValue: evaluatedSum };
        }
        memo.set(idx, currentResult);
        return currentResult;
    };

    // Compute the final value at the target index
    const finalComputedValues = obtainValue(limitValue);
    
    // The final output logic depends on the 'originalSumValue' from the last iteration
    // and the 'storedRepresentation' of the last element.
    if (finalComputedValues.originalSumValue <= capValue) {
        console.log(finalComputedValues.storedRepresentation);
    } else {
        console.log(finalComputedValues.storedRepresentation * factor);
    }
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));