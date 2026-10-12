function primeFactorDecomposition(inputNum) {
    let primeFactorsList = [];
    let currentWorkingNum = inputNum;

    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= currentWorkingNum; divisorCandidate++) {
        let powerCount = 0;
        while (currentWorkingNum % divisorCandidate === 0) {
            currentWorkingNum /= divisorCandidate;
            powerCount++;
        }
        if (powerCount > 0) {
            const factorEntry = { primeVal: divisorCandidate, exponentVal: powerCount };
            primeFactorsList.push(factorEntry);
        }
    }
    
    if (currentWorkingNum > 1) {
        primeFactorsList.push({ primeVal: currentWorkingNum, exponentVal: 1 });
    }
    return primeFactorsList;
}

const updatePrimeExponentMap = (primeMap, factorObject) => {
    const { primeVal, exponentVal } = factorObject;
    primeMap[primeVal] = (primeMap[primeVal] || 0) + exponentVal;
};

function processInputAndCalculate(inputString) {
    const upperBound = Number(inputString);
    const moduloConstant = 10**9 + 7;
    
    let totalPrimeExponents = {};
    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        const currentNumFactors = primeFactorDecomposition(currentNumber);
        currentNumFactors.forEach(entry => updatePrimeExponentMap(totalPrimeExponents, entry));
    }

    let finalResult = 1;
    for (const primeEntry of Object.entries(totalPrimeExponents)) {
        const primeKey = primeEntry[0];
        const exponentSum = primeEntry[1];
        finalResult = (finalResult * (exponentSum + 1)) % moduloConstant;
    }
    console.log(finalResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
