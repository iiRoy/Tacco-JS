function processInput(rawData) {
    const limitNum = Number(rawData);
    const primeFactorCounts = {};

    const updatePrimeFactors = (numToFactor, countsMap) => {
        let currentDivisible = numToFactor;
        for (let potentialDivisor = 2; potentialDivisor * potentialDivisor <= currentDivisible; potentialDivisor++) {
            if (currentDivisible % potentialDivisor === 0) {
                let currentFactorCount = 0;
                while (currentDivisible % potentialDivisor === 0) {
                    currentFactorCount++;
                    currentDivisible /= potentialDivisor;
                }
                countsMap[potentialDivisor] = (countsMap[potentialDivisor] || 0) + currentFactorCount;
            }
        }
        if (currentDivisible > 1) {
            countsMap[currentDivisible] = (countsMap[currentDivisible] || 0) + 1;
        }
    };

    for (let iterationNum = 2; iterationNum <= limitNum; iterationNum++) {
        updatePrimeFactors(iterationNum, primeFactorCounts);
    }

    let finalResult = 1;
    const moduloValue = 1000000007;

    Object.keys(primeFactorCounts).forEach(primeKeyString => {
        const primeExponent = primeFactorCounts[primeKeyString];
        const termForProduct = primeExponent + 1;
        finalResult = (finalResult * termForProduct) % moduloValue;
    });

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
