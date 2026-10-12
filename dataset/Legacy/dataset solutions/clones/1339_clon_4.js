var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var initialValue = parseInt(sourceData);

function computePrimeDecomposition(targetNumber, currentDivisor = 2, accumulatedFactors = []) {
    if (targetNumber === 1) {
        return accumulatedFactors;
    }

    if (currentDivisor * currentDivisor > targetNumber) {
        accumulatedFactors.push(targetNumber);
        return accumulatedFactors;
    }

    if (targetNumber % currentDivisor === 0) {
        accumulatedFactors.push(currentDivisor);
        return computePrimeDecomposition(targetNumber / currentDivisor, currentDivisor, accumulatedFactors);
    } else {
        let nextDivisor;
        if (currentDivisor === 2) {
            nextDivisor = 3;
        } else {
            nextDivisor = currentDivisor + 2;
        }
        return computePrimeDecomposition(targetNumber, nextDivisor, accumulatedFactors);
    }
}

var factorList = computePrimeDecomposition(initialValue);

console.log(initialValue + ': ' + factorList.join(' '));
