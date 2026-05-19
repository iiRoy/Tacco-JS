"use strict";

const processInput = inputData => {
    const targetIndex = Number(inputData.split("\n")[0]);
    console.log(computeLucasTerm(targetIndex));
};

const computeLucasTerm = (() => {
    const memoizationCache = new Map();

    memoizationCache.set(0, 2);
    memoizationCache.set(1, 1);

    const calculateTerm = (idx) => {
        if (memoizationCache.has(idx)) {
            return memoizationCache.get(idx);
        }

        const termValue = calculateTerm(idx - 1) + calculateTerm(idx - 2);
        memoizationCache.set(idx, termValue);
        return termValue;
    };

    return calculateTerm;
})();

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
