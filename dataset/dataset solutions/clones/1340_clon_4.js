const obtainNumericalSource = () => {
    return parseInt(require('node:fs').readFileSync('/dev/stdin', 'utf8').trim(), 10);
};

const decomposeNumberRecursively = (remainingValue, currentDivisorCandidate, collectedFactors) => {
    if (remainingValue === 1) {
        return collectedFactors;
    }

    // Optimization: if currentDivisorCandidate squared is greater than remainingValue,
    // then remainingValue must be a prime itself (if it's greater than 1).
    if (currentDivisorCandidate * currentDivisorCandidate > remainingValue) {
        if (remainingValue > 1) {
            collectedFactors.push(remainingValue);
        }
        return collectedFactors;
    }

    if (remainingValue % currentDivisorCandidate === 0) {
        collectedFactors.push(currentDivisorCandidate);
        return decomposeNumberRecursively(remainingValue / currentDivisorCandidate, currentDivisorCandidate, collectedFactors);
    } else {
        return decomposeNumberRecursively(remainingValue, currentDivisorCandidate + 1, collectedFactors);
    }
};

const numericalInput = obtainNumericalSource();
const preservedOriginalInput = numericalInput;

const factorizedResult = decomposeNumberRecursively(numericalInput, 2, []);

console.log(preservedOriginalInput + ': ' + factorizedResult.join(' '));