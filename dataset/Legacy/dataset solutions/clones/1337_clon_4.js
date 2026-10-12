var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var initialValue = parseInt(sourceData);

function calculatePrimeComponents(currentDividend, currentDivisor, collectedFactors) {
    if (currentDivisor >= currentDividend) {
        return {
            remainder: currentDividend,
            factorsFound: collectedFactors
        };
    }

    if (currentDividend % currentDivisor === 0) {
        collectedFactors.push(currentDivisor);
        return calculatePrimeComponents(currentDividend / currentDivisor, currentDivisor, collectedFactors);
    } else {
        return calculatePrimeComponents(currentDividend, currentDivisor + 1, collectedFactors);
    }
}

var factorizationResult = calculatePrimeComponents(initialValue, 2, []);

process.stdout.write(factorizationResult.remainder + ': ');
process.stdout.write(factorizationResult.factorsFound.join(' ') + "\n");
