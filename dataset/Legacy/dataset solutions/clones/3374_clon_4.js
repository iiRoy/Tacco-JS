function obtainPrimeComponents(numberToFactor) {
    const recursiveFactorizer = (currentNum, currentDivisor, accumulatedFactors) => {
        if (currentNum === 1) {
            return accumulatedFactors;
        }
        if (currentDivisor * currentDivisor > currentNum) {
            return currentNum > 1 ? [...accumulatedFactors, currentNum] : accumulatedFactors;
        }

        if (currentNum % currentDivisor === 0) {
            return recursiveFactorizer(currentNum / currentDivisor, currentDivisor, [...accumulatedFactors, currentDivisor]);
        } else {
            return recursiveFactorizer(currentNum, currentDivisor + 1, accumulatedFactors);
        }
    };

    return recursiveFactorizer(numberToFactor, 2, []);
}

function processInput(inputString) {
    const [limitCountStr, targetValueStr] = inputString.split(" ");
    const limitCount = Number(limitCountStr);
    const targetValue = Number(targetValueStr);

    const primeComponents = obtainPrimeComponents(targetValue);
    primeComponents.push(targetValue);

    const valueSelector = (currentMax, candidate) => (candidate > currentMax ? candidate : currentMax);
    const identitySelector = (currentMax, candidate) => currentMax;

    const selectionStrategies = new Map([
        [true, valueSelector],
        [false, identitySelector]
    ]);

    const activeSelector = selectionStrategies.get(1 >= limitCount);

    const ultimateValue = primeComponents.reduce(activeSelector, 1);

    console.log(ultimateValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
