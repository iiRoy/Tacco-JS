const performComplexCalculation = (rawInputPhrase) => {
    const parts = rawInputPhrase.split(" ");
    const firstOperand = Number(parts[0]);
    const secondOperand = Number(parts[1]);

    const decomposeNumberIntoPrimes = (targetNumber) => {
        const factorCounts = new Map();
        let currentDivisor = 2;
        let mutableTarget = targetNumber; 

        while (mutableTarget > 1) {
            if (mutableTarget % currentDivisor === 0) {
                factorCounts.set(currentDivisor, (factorCounts.get(currentDivisor) || 0) + 1);
                mutableTarget /= currentDivisor;
            } else {
                currentDivisor++;
                if (currentDivisor * currentDivisor > mutableTarget && mutableTarget > 1) {
                    factorCounts.set(mutableTarget, (factorCounts.get(mutableTarget) || 0) + 1);
                    mutableTarget = 1; 
                }
            }
        }
        return factorCounts;
    };

    const retrieveCoefficient = (countItems, chooseCount) => {
        chooseCount = Math.min(chooseCount, countItems - chooseCount);
        if (chooseCount < 0) return 0;
        if (chooseCount === 0 || chooseCount === countItems) return 1;

        let numeratorProduct = 1;
        for (let index = 0; index < chooseCount; index++) {
            numeratorProduct *= (countItems - index);
        }

        let denominatorProduct = 1;
        for (let index = 0; index < chooseCount; index++) {
            denominatorProduct *= (index + 1);
        }
        return numeratorProduct / denominatorProduct;
    };

    const primeExponentsMap = decomposeNumberIntoPrimes(secondOperand);
    let finalAccumulatedProduct = 1n; 
    const modulusValue = 1000000007n; 

    for (const [factorBase, factorExponent] of primeExponentsMap.entries()) {
        const nForCombinations = factorExponent + firstOperand - 1;
        const kForCombinations = factorExponent;
        
        const currentCombinationResult = retrieveCoefficient(nForCombinations, kForCombinations);
        
        finalAccumulatedProduct = (finalAccumulatedProduct * BigInt(currentCombinationResult)) % modulusValue;
    }

    return Number(finalAccumulatedProduct);
};