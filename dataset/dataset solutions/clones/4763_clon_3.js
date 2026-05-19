function getPrimeExponents(valueToFactor) {
    let primeFactorList = [];
    let currentNumber = valueToFactor;

    let divisorCandidate = 2;
    while (divisorCandidate * divisorCandidate <= currentNumber) {
        let currentExponent = 0;
        while (currentNumber % divisorCandidate === 0) {
            currentNumber /= divisorCandidate;
            currentExponent++;
        }
        if (currentExponent > 0) {
            primeFactorList.push({ p: divisorCandidate, e: currentExponent });
        }
        divisorCandidate++;
    }

    if (currentNumber > 1) {
        primeFactorList.push({ p: currentNumber, e: 1 });
    }
    return primeFactorList;
}

function updateAggregatedFactors(factorMap, primeFactor) {
    const primeValue = primeFactor.p;
    const exponentValue = primeFactor.e;

    if (Object.prototype.hasOwnProperty.call(factorMap, primeValue)) {
        factorMap[primeValue] += exponentValue;
    } else {
        factorMap[primeValue] = exponentValue;
    }
}

function mainProcess(inputArgument) {
    const inputNumberLimit = Number(inputArgument);
    const moduloConstant = 10 ** 9 + 7;

    let aggregatedPrimeCounts = {};
    for (let currentIterationNum = 1; currentIterationNum <= inputNumberLimit; currentIterationNum++) {
        let factorsForCurrentNum = getPrimeExponents(currentIterationNum);
        factorsForCurrentNum.forEach(singleFactorEntry => {
            updateAggregatedFactors(aggregatedPrimeCounts, singleFactorEntry);
        });
    }

    console.log(aggregatedPrimeCounts);

    let finalProductResult = 1;
    for (const [primeBase, totalExponent] of Object.entries(aggregatedPrimeCounts)) {
        const termForMultiplication = (totalExponent + 1);
        finalProductResult = (finalProductResult * termForMultiplication) % moduloConstant;
    }
    console.log(finalProductResult);
}

mainProcess(require("fs").readFileSync("/dev/stdin", "utf8"));
