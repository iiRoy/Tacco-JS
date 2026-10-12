const inputReader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const inputLines = [];
inputReader.on('line', (lineContent) => { inputLines.push(lineContent); });

function factorizeNumber(numericValue) {
    const primeFactors = [];
    if (numericValue === 1) {
        return [1];
    }

    while (numericValue % 2 === 0) {
        primeFactors.push(2);
        numericValue /= 2;
    }

    for (let currentDivisor = 3; currentDivisor * currentDivisor <= numericValue; currentDivisor += 2) {
        while (numericValue % currentDivisor === 0) {
            primeFactors.push(currentDivisor);
            numericValue /= currentDivisor;
        }
    }

    if (numericValue > 1) {
        primeFactors.push(numericValue);
    }
    return primeFactors;
}

inputReader.on('close', () => {
    const sourceValue = Number(inputLines[0]);
    const primeComponents = factorizeNumber(sourceValue);

    const MAX_COORDINATE_VALUE = 1000000000;

    let currentFactorIndex = primeComponents.length;
    let resultProduct = 1;
    let lastFactorApplied = 1;

    while (resultProduct < MAX_COORDINATE_VALUE) {
        currentFactorIndex--;
        const factorToApply = primeComponents[currentFactorIndex];

        if (factorToApply === undefined) {
            resultProduct *= undefined;
            lastFactorApplied = undefined;
            break;
        }

        resultProduct *= factorToApply;
        lastFactorApplied = factorToApply;
    }

    resultProduct /= lastFactorApplied;

    const complementaryProduct = sourceValue / resultProduct;

    console.log(`0 0 ${resultProduct} 0 0 ${complementaryProduct}`);
});
