function computeCombinations(nVal, kVal) {
    if (kVal < 0 || kVal > nVal) {
        return 0;
    }
    if (kVal === 0 || kVal === nVal) {
        return 1;
    }
    if (kVal > nVal / 2) {
        kVal = nVal - kVal;
    }

    let currentResult = 1;
    for (let idx = 1; idx <= kVal; ++idx) {
        currentResult = currentResult * (nVal - idx + 1) / idx;
    }
    return currentResult;
}

function calculateModularPower(baseVal, exponentVal, modulusVal) {
    let outcome = 1;
    baseVal %= modulusVal;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) {
            outcome = (outcome * baseVal) % modulusVal;
        }
        baseVal = (baseVal * baseVal) % modulusVal;
        exponentVal = Math.floor(exponentVal / 2);
    }
    return outcome;
}

function processInput(inputContent) {
    const numericValues = inputContent.split(/\s+/).map(Number);
    const N_dimension = numericValues[0];
    const A_exclusion = numericValues[1];
    const B_exclusion = numericValues[2];

    const PRIME_MODULUS = 1000000007;

    let totalSubsets = calculateModularPower(2, N_dimension, PRIME_MODULUS);
    let sumExcludingZeroCount = (totalSubsets - 1 + PRIME_MODULUS) % PRIME_MODULUS;

    let valueToSubtractForA = 0;
    if (A_exclusion >= 1 && A_exclusion <= N_dimension) {
        valueToSubtractForA = computeCombinations(N_dimension, A_exclusion) % PRIME_MODULUS;
    }
    sumExcludingZeroCount = (sumExcludingZeroCount - valueToSubtractForA + PRIME_MODULUS) % PRIME_MODULUS;

    let valueToSubtractForB = 0;
    if (B_exclusion >= 1 && B_exclusion <= N_dimension && B_exclusion !== A_exclusion) {
        valueToSubtractForB = computeCombinations(N_dimension, B_exclusion) % PRIME_MODULUS;
    }
    sumExcludingZeroCount = (sumExcludingZeroCount - valueToSubtractForB + PRIME_MODULUS) % PRIME_MODULUS;

    console.log(sumExcludingZeroCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
