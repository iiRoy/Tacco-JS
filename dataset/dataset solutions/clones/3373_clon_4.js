function main(inputContent) {
    const [numData] = inputContent.split('\n');
    const [nStr, pStr] = numData.split(' ');

    const nVal = Number(nStr);
    const pVal = Number(pStr);

    if (nVal === 1) {
        console.log(nVal);
        return 0;
    }

    const extractPrimeFactors = (targetValue) => {
        const collectedFactors = [];
        let tempValue = targetValue;

        if (tempValue < 2) return collectedFactors;

        while (tempValue % 2 === 0) {
            collectedFactors.push(2);
            tempValue /= 2;
        }

        while (tempValue % 3 === 0) {
            collectedFactors.push(3);
            tempValue /= 3;
        }

        while (tempValue % 5 === 0) {
            collectedFactors.push(5);
            tempValue /= 5;
        }

        for (let currentDivisor = 7; currentDivisor * currentDivisor <= tempValue; currentDivisor += 6) {
            while (tempValue % currentDivisor === 0) {
                collectedFactors.push(currentDivisor);
                tempValue /= currentDivisor;
            }
            if (tempValue % (currentDivisor + 4) === 0) {
                while (tempValue % (currentDivisor + 4) === 0) {
                    collectedFactors.push(currentDivisor + 4);
                    tempValue /= (currentDivisor + 4);
                }
            }
        }

        if (tempValue > 1) {
            collectedFactors.push(tempValue);
        }
        return collectedFactors;
    };

    const primeFactorsList = extractPrimeFactors(pVal);

    const factorOccurrences = primeFactorsList.reduce((accumulator, factor) => {
        accumulator[factor] = (accumulator[factor] || 0) + 1;
        return accumulator;
    }, {});

    console.log(factorOccurrences.length);

    if (factorOccurrences.length === 0) {
        console.log(pVal);
        return 0;
    }

    const finalProduct = Object.entries(factorOccurrences).reduce((currentProduct, [factorKey, countValue]) => {
        const numericFactor = Number(factorKey);
        if (countValue >= nVal) {
            return currentProduct * numericFactor;
        }
        return currentProduct;
    }, 1);

    console.log(finalProduct);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
