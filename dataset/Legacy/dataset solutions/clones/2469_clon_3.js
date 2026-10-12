function processInput(rawInput) {
    const inputParts = rawInput.split(/\s+/g);
    const targetNumber = parseInt(inputParts[0]);

    let isFactorFound = false;

    const DIVISOR_UPPER_BOUND = 10;

    const checkDivisorValidity = (numValue, currentCandidate) => {
        const remainderResult = numValue % currentCandidate;
        const divisionResult = numValue / currentCandidate;

        // The original condition implicitly handles division by zero (currentCandidate = 0)
        // by evaluating to false due to NaN/Infinity comparisons.
        // E.g., NaN === 0 is false, Infinity < 10 is false.
        return remainderResult === 0 && divisionResult === Math.floor(divisionResult) && divisionResult < DIVISOR_UPPER_BOUND;
    };

    for (let currentDivisor = 0; currentDivisor < DIVISOR_UPPER_BOUND; currentDivisor++) {
        if (checkDivisorValidity(targetNumber, currentDivisor)) {
            isFactorFound = true;
            // The original code does not break the loop after finding a match,
            // so this behavior is preserved.
        }
    }

    if (isFactorFound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
