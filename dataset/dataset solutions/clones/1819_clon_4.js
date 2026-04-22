function factorizeNumber(valueToDecompose, currentDiv = 2, primeExponents = {}) {
    if (valueToDecompose === 1) {
        return primeExponents;
    }

    if (currentDiv * currentDiv > valueToDecompose) {
        if (valueToDecompose > 1) {
            primeExponents[valueToDecompose] = (primeExponents[valueToDecompose] || 0) + 1;
        }
        return primeExponents;
    }

    if (valueToDecompose % currentDiv === 0) {
        primeExponents[currentDiv] = (primeExponents[currentDiv] || 0) + 1;
        return factorizeNumber(valueToDecompose / currentDiv, currentDiv, primeExponents);
    } else {
        return factorizeNumber(valueToDecompose, currentDiv + 1, primeExponents);
    }
}

function computeResult(entryDatum) {
    let originalNumber = parseInt(entryDatum);

    if (originalNumber === 1) {
        return console.log(0);
    }

    const exponentMap = factorizeNumber(originalNumber);
    let totalCount = 0;

    for (const primeFactor in exponentMap) {
        const exponent = exponentMap[primeFactor];
        totalCount += Math.ceil(exponent / 2);
    }

    console.log(totalCount);
}

computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));