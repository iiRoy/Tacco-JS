const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const initialValue = parseInt(sourceData);

function obtainPrimeFactors(valueToFactor, currentDivisor = 2, factorCollector = []) {
    if (valueToFactor === 1) {
        return factorCollector;
    }

    if (currentDivisor * currentDivisor > valueToFactor && valueToFactor > 1) {
        factorCollector.push(valueToFactor);
        return factorCollector;
    }

    if (valueToFactor % currentDivisor === 0) {
        factorCollector.push(currentDivisor);
        return obtainPrimeFactors(valueToFactor / currentDivisor, currentDivisor, factorCollector);
    } else {
        return obtainPrimeFactors(valueToFactor, currentDivisor + 1, factorCollector);
    }
}

const collectedFactors = obtainPrimeFactors(initialValue);

console.log(initialValue + ': ' + collectedFactors.join(' '));
