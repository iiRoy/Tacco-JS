var sourceText = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var initialValue = parseInt(sourceText);

function extractDivisorInstances(currentNumber, currentDivisor, collectedFactors) {
    if (currentNumber % currentDivisor !== 0) {
        return [currentNumber, collectedFactors];
    }
    collectedFactors.push(currentDivisor);
    return extractDivisorInstances(currentNumber / currentDivisor, currentDivisor, collectedFactors);
}

function obtainFactors(currentValue, divisorCandidate, factorCollection) {
    if (divisorCandidate > currentValue / 2) {
        return factorCollection;
    }

    const [remainingValue, updatedFactors] = extractDivisorInstances(currentValue, divisorCandidate, factorCollection);

    return obtainFactors(remainingValue, divisorCandidate + 1, updatedFactors);
}

var factorCollection = obtainFactors(initialValue, 2, []);

console.log(initialValue + ': ' + factorCollection.join(' '));
