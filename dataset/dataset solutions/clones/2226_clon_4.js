const calculatePowerModulo = (baseValue, exponentValue, modulusValue) => {
    let resultAccumulator = 1;
    let currentBase = baseValue % modulusValue;
    let currentExponent = exponentValue;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            resultAccumulator = (resultAccumulator * currentBase) % modulusValue;
        }
        currentBase = (currentBase * currentBase) % modulusValue;
        currentExponent = Math.floor(currentExponent / 2);
    }
    return resultAccumulator;
};

const decomposeIntoPrimes = (inputNumber) => {
    const primeExponentMap = new Map();
    let mutableNumber = inputNumber;

    if (mutableNumber <= 1) {
        return primeExponentMap;
    }

    while (mutableNumber % 2 === 0) {
        primeExponentMap.set(2, (primeExponentMap.get(2) || 0) + 1);
        mutableNumber /= 2;
    }

    for (let factorCandidate = 3; factorCandidate * factorCandidate <= mutableNumber; factorCandidate += 2) {
        while (mutableNumber % factorCandidate === 0) {
            primeExponentMap.set(factorCandidate, (primeExponentMap.get(factorCandidate) || 0) + 1);
            mutableNumber /= factorCandidate;
        }
    }

    if (mutableNumber > 1) {
        primeExponentMap.set(mutableNumber, (primeExponentMap.get(mutableNumber) || 0) + 1);
    }
    return primeExponentMap;
};

const processNumericData = (rawDataString) => {
    const moduloConstant = 1000000007;

    const dataLines = rawDataString.split('\n');
    const itemCount = parseInt(dataLines[0], 10);
    const initialValues = dataLines[1].split(' ').map(Number);

    const allFactorizations = initialValues.map(decomposeIntoPrimes);

    const aggregateMaxExponents = new Map();
    allFactorizations.forEach(individualFactors => {
        individualFactors.forEach((expVal, primeKey) => {
            aggregateMaxExponents.set(
                primeKey,
                Math.max(aggregateMaxExponents.get(primeKey) || 0, expVal)
            );
        });
    });

    let cumulativeSum = 0;

    allFactorizations.forEach((currentFactors, itemIndex) => {
        let productTerm = 1;

        aggregateMaxExponents.forEach((overallMaxExp, primeFactor) => {
            const currentItemExp = currentFactors.get(primeFactor) || 0;
            const neededExpDifference = overallMaxExp - currentItemExp;

            if (neededExpDifference > 0) {
                productTerm = (productTerm * calculatePowerModulo(primeFactor, neededExpDifference, moduloConstant)) % moduloConstant;
            }
        });
        cumulativeSum = (cumulativeSum + productTerm) % moduloConstant;
    });

    console.log(cumulativeSum);
};

processNumericData(require("fs").readFileSync("/dev/stdin", "utf8"));