"use strict";

const checkAndCalculateW = (currentN, hVal, nVal) => {
    const numeratorTerm = currentN * hVal * nVal;
    const denominatorTerm = (4 * hVal * nVal) - (currentN * nVal) - (currentN * hVal);

    if (denominatorTerm <= 0) {
        return null;
    }

    const calculatedW = numeratorTerm / denominatorTerm;

    if (calculatedW > 0 && Number.isInteger(calculatedW)) {
        return calculatedW;
    } else {
        return null;
    }
};

const findIntegerSolution = (rawInput) => {
    const processedInputLines = rawInput.trim().split("\n");
    const targetValueN = parseInt(processedInputLines[0], 10);

    const MAX_ITERATION_LIMIT = 3500;

    for (let h_candidate = 1; h_candidate <= MAX_ITERATION_LIMIT; h_candidate++) {
        for (let n_candidate = 1; n_candidate <= MAX_ITERATION_LIMIT; n_candidate++) {
            const w_found = checkAndCalculateW(targetValueN, h_candidate, n_candidate);

            if (w_found !== null) {
                console.log(`${h_candidate} ${n_candidate} ${w_found}`);
                return;
            }
        }
    }
};

findIntegerSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
