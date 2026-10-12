function primeDecomposition(numVal) {
    let primeFactorsList = [];
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= numVal; divisorCandidate++) {
        let powerCount = 0;
        while (numVal % divisorCandidate === 0) {
            numVal /= divisorCandidate;
            powerCount++;
        }
        if (powerCount > 0) {
            primeFactorsList.push({ basePrime: divisorCandidate, exponentValue: powerCount });
        }
    }

    if (numVal !== 1) {
        primeFactorsList.push({ basePrime: numVal, exponentValue: 1 });
    }
    return primeFactorsList;
}


function executeProgram(inputString) {
    let upperBound = Number(inputString);
    const moduloValue = 1000000007;

    let totalPrimeExponents = {};
    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        let currentFactors = primeDecomposition(currentNumber);
        currentFactors.forEach(factorEntry => {
            if (totalPrimeExponents[factorEntry.basePrime]) {
                totalPrimeExponents[factorEntry.basePrime] += factorEntry.exponentValue;
            } else {
                totalPrimeExponents[factorEntry.basePrime] = factorEntry.exponentValue;
            }
        });
    }
    console.log(totalPrimeExponents);
    let resultProduct = 1;
    Object.keys(totalPrimeExponents).forEach(primeKey => {
        resultProduct *= (totalPrimeExponents[primeKey] + 1);
        resultProduct %= moduloValue;
    });
    console.log(resultProduct);
}
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
