function modularPower(base, exponent, modulus) {
    let resultAccumulator = 1;
    base %= modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            resultAccumulator = (resultAccumulator * base) % modulus;
        }
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return resultAccumulator;
}

function ProcessInputData(inputPayload) {
    const dataLines = inputPayload.split("\n");
    const elementCount = parseInt(dataLines[0], 10);
    const originalNumbers = dataLines[1].split(' ').map(Number);

    const distinctPrimeSet = new Set();
    const factorMapsPerElement = new Array(elementCount);
    const highestPrimeCounts = new Map();
    const secondHighestPrimeCounts = new Map();

    for (let idx = 0; idx < elementCount; idx++) {
        let currentVal = originalNumbers[idx];
        const currentElementFactors = new Map();
        factorMapsPerElement[idx] = currentElementFactors;

        for (let divisor = 2; divisor * divisor <= currentVal; divisor++) {
            if (currentVal % divisor === 0) {
                distinctPrimeSet.add(divisor);
                let count = 0;
                while (currentVal % divisor === 0) {
                    count++;
                    currentVal /= divisor;
                }
                currentElementFactors.set(divisor, count);

                let currentMax = highestPrimeCounts.get(divisor) || 0;
                let currentSecondMax = secondHighestPrimeCounts.get(divisor) || 0;

                if (count > currentMax) {
                    secondHighestPrimeCounts.set(divisor, currentMax);
                    highestPrimeCounts.set(divisor, count);
                } else if (count > currentSecondMax) {
                    secondHighestPrimeCounts.set(divisor, count);
                }
            }
        }

        if (currentVal > 1) { // Remaining currentVal is a prime factor
            const primeRemainder = currentVal;
            distinctPrimeSet.add(primeRemainder);
            const count = 1;
            currentElementFactors.set(primeRemainder, count);

            let currentMax = highestPrimeCounts.get(primeRemainder) || 0;
            let currentSecondMax = secondHighestPrimeCounts.get(primeRemainder) || 0;

            if (count > currentMax) {
                secondHighestPrimeCounts.set(primeRemainder, currentMax);
                highestPrimeCounts.set(primeRemainder, count);
            } else if (count > currentSecondMax) {
                secondHighestPrimeCounts.set(primeRemainder, count);
            }
        }
    }

    const requiredFactorExponents = new Array(elementCount);
    const MOD_VAL = 1000000007;

    for (let idx = 0; idx < elementCount; idx++) {
        requiredFactorExponents[idx] = new Map();
        const currentElementFactorMap = factorMapsPerElement[idx];

        for (const primeKey of distinctPrimeSet) {
            const elementPrimeCount = currentElementFactorMap.get(primeKey) || 0;
            const overallMaxCount = highestPrimeCounts.get(primeKey) || 0;
            const overallSecondMaxCount = secondHighestPrimeCounts.get(primeKey) || 0;

            const targetCountForOthers = (elementPrimeCount === overallMaxCount)
                ? overallSecondMaxCount
                : overallMaxCount;

            const additionalExponent = Math.max(0, targetCountForOthers - elementPrimeCount);

            if (additionalExponent > 0) {
                requiredFactorExponents[idx].set(primeKey, additionalExponent);
            }
        }
    }

    let finalResultSum = 0;
    for (let idx = 0; idx < elementCount; idx++) {
        let productForCurrentElement = 1;
        for (const [primeKey, exponent] of requiredFactorExponents[idx]) {
            productForCurrentElement = (productForCurrentElement * modularPower(primeKey, exponent, MOD_VAL)) % MOD_VAL;
        }
        finalResultSum = (finalResultSum + productForCurrentElement) % MOD_VAL;
    }

    console.log(finalResultSum);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
