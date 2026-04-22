const obtainPrimeFactors = (targetValue, currentDivisor = 2, accumulatedFactors = []) => {
    if (targetValue <= 1) {
        return accumulatedFactors;
    }

    if (currentDivisor * currentDivisor > targetValue) {
        if (targetValue > 1) {
            return accumulatedFactors.concat([{ element: targetValue, frequency: 1 }]);
        }
        return accumulatedFactors;
    }

    if (targetValue % currentDivisor === 0) {
        let count = 0;
        let temporaryValue = targetValue;
        while (temporaryValue % currentDivisor === 0) {
            temporaryValue /= currentDivisor;
            count++;
        }
        return obtainPrimeFactors(temporaryValue, currentDivisor, accumulatedFactors.concat([{ element: currentDivisor, frequency: count }]));
    } else {
        return obtainPrimeFactors(targetValue, currentDivisor + 1, accumulatedFactors);
    }
};

const processCalculation = (inputPayload) => {
    const valuesAsNumbers = inputPayload.trim().split(" ").map(Number);
    const rootIndex = valuesAsNumbers[0];
    const baseNumber = valuesAsNumbers[1];

    const factorList = obtainPrimeFactors(baseNumber);

    const finalResult = factorList.reduce((currentProduct, factorEntry) => {
        const effectivePower = Math.floor(factorEntry.frequency / rootIndex);
        return currentProduct * Math.pow(factorEntry.element, effectivePower);
    }, 1);

    process.stdout.write(String(finalResult) + '\n');
};

processCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));