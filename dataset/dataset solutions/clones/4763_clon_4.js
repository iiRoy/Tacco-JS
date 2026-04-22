function retrievePrimesBelow(upperBound) {
    const isPrime = new Array(upperBound + 1).fill(true);
    if (upperBound >= 0) isPrime[0] = false;
    if (upperBound >= 1) isPrime[1] = false;
    for (let currentNum = 2; currentNum * currentNum <= upperBound; currentNum++) {
        if (isPrime[currentNum]) {
            for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
                isPrime[multiple] = false;
            }
        }
    }
    const primeNumbers = [];
    for (let num = 2; num <= upperBound; num++) {
        if (isPrime[num]) {
            primeNumbers.push(num);
        }
    }
    return primeNumbers;
}

function determineFactorialPrimePowers(limitValue, primeCollection) {
    const primePowerAccumulator = {};
    for (const currentPrime of primeCollection) {
        let currentPower = 0;
        let pTerm = currentPrime;
        while (pTerm <= limitValue) {
            currentPower += Math.floor(limitValue / pTerm);
            if (pTerm > limitValue / currentPrime) { 
                break; 
            }
            pTerm *= currentPrime;
        }
        if (currentPower > 0) {
            primePowerAccumulator[currentPrime] = currentPower;
        }
    }
    return primePowerAccumulator;
}

function calculateTotalDivisors(primeExponentData, modulusValue) {
    let finalProduct = 1;
    for (const prime in primeExponentData) {
        if (Object.prototype.hasOwnProperty.call(primeExponentData, prime)) {
            const exponent = primeExponentData[prime];
            finalProduct = (finalProduct * (exponent + 1)) % modulusValue;
        }
    }
    return finalProduct;
}

function processInputData(inputArgument) {
    const numericLimit = Number(inputArgument);
    const divisorMod = 1000000007; 
    
    const discoveredPrimes = retrievePrimesBelow(numericLimit);
    const factorialPrimeBreakdown = determineFactorialPrimePowers(numericLimit, discoveredPrimes);

    console.log(factorialPrimeBreakdown);
    const resultantDivisorCount = calculateTotalDivisors(factorialPrimeBreakdown, divisorMod);
    console.log(resultantDivisorCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));