const processInputAndCompute = (dataString) => {
    const initialValue = Number(dataString);

    const factorialMemo = new Map();
    const calculateFactorial = (num) => {
        if (num === 0 || num === 1) return 1;
        if (factorialMemo.has(num)) return factorialMemo.get(num);
        const result = num * calculateFactorial(num - 1);
        factorialMemo.set(num, result);
        return result;
    };

    const totalFactorialValue = calculateFactorial(initialValue);

    const retrieveProperFactors = (quantity) => {
        const properFactors = new Set();
        for (let trialDivisor = 1; trialDivisor * trialDivisor <= quantity; trialDivisor++) {
            if (quantity % trialDivisor === 0) {
                properFactors.add(trialDivisor);
                if (trialDivisor * trialDivisor !== quantity) {
                    properFactors.add(quantity / trialDivisor);
                }
            }
        }
        properFactors.delete(quantity);
        return Array.from(properFactors);
    };

    const allProperFactors = retrieveProperFactors(totalFactorialValue);

    const countAllFactors = (numToFactor) => {
        if (numToFactor === 0) return 0;
        if (numToFactor === 1) return 1;

        let workingNum = numToFactor;
        let factorCount = 1;

        for (let currentPrime = 2; currentPrime * currentPrime <= workingNum; currentPrime++) {
            if (workingNum % currentPrime === 0) {
                let exponentValue = 0;
                while (workingNum % currentPrime === 0) {
                    workingNum /= currentPrime;
                    exponentValue++;
                }
                factorCount *= (exponentValue + 1);
            }
        }
        if (workingNum > 1) {
            factorCount *= 2;
        }
        return factorCount;
    };

    let finalAccumulator = 0;

    for (const factorElement of allProperFactors) {
        if (factorElement % 2 === 0) {
            const derivedHalf = factorElement / 2;
            const factorsOfHalf = countAllFactors(derivedHalf);
            if (factorsOfHalf === 75) {
                finalAccumulator++;
            }
        }
    }

    console.log(finalAccumulator);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));