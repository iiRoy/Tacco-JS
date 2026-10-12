function obtainPrimeFactors(valueToFactor, currentDivisor = 2, factorCollection = []) {
    if (valueToFactor === 1) {
        return factorCollection;
    }
    
    if (currentDivisor * currentDivisor > valueToFactor) {
        if (valueToFactor > 1) {
            factorCollection.push(valueToFactor);
        }
        return factorCollection;
    }

    if (valueToFactor % currentDivisor === 0) {
        factorCollection.push(currentDivisor);
        return obtainPrimeFactors(valueToFactor / currentDivisor, currentDivisor, factorCollection);
    } else {
        return obtainPrimeFactors(valueToFactor, currentDivisor + 1, factorCollection);
    }
}

function processInputAndCalculate(inputString) {
    const numberValue = parseInt(inputString);

    if (numberValue === 1) {
        return console.log(0);
    }

    const factorList = obtainPrimeFactors(numberValue);

    const finalState = factorList.reduce((accumulator, currentFactor) => {
        let { uniqueSet, previousFactor, currentProductValue, totalCount } = accumulator;
        let candidateProduct = currentProductValue;

        if (previousFactor !== currentFactor) {
            candidateProduct = currentFactor;
        }

        if (!uniqueSet.has(candidateProduct)) {
            uniqueSet.add(candidateProduct);
            totalCount++;
        } else {
            candidateProduct *= currentFactor;
        }

        return {
            uniqueSet,
            previousFactor: currentFactor,
            currentProductValue: candidateProduct,
            totalCount
        };
    }, { uniqueSet: new Set(), previousFactor: 0, currentProductValue: 0, totalCount: 0 });

    console.log(finalState.totalCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
