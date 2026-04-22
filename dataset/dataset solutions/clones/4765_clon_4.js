function processFactorialDivisors(inputString) {
    const limitValue = Math.floor(parseFloat(inputString));
    const modulusConstant = 1000000007;

    const primeTracker = new Array(limitValue + 1).fill(true);
    primeTracker[0] = false;
    primeTracker[1] = false;

    for (let pCandidate = 2; pCandidate * pCandidate <= limitValue; pCandidate++) {
        if (primeTracker[pCandidate]) {
            for (let multiple = pCandidate * pCandidate; multiple <= limitValue; multiple += pCandidate) {
                primeTracker[multiple] = false;
            }
        }
    }

    const collectedPrimes = [];
    for (let currentNumber = 2; currentNumber <= limitValue; currentNumber++) {
        if (primeTracker[currentNumber]) {
            collectedPrimes.push(currentNumber);
        }
    }

    const calculatePrimeExponent = (targetValue, primeBase) => {
        let totalCount = 0;
        let currentPower = primeBase;
        while (currentPower <= targetValue) {
            totalCount += Math.floor(targetValue / currentPower);
            if (currentPower > targetValue / primeBase) break;
            currentPower *= primeBase;
        }
        return totalCount;
    };

    let finalProduct = 1;

    for (const currentPrime of collectedPrimes) {
        const primePowerInFactorial = calculatePrimeExponent(limitValue, currentPrime);
        finalProduct = (finalProduct * (primePowerInFactorial + 1)) % modulusConstant;
    }

    console.log(finalProduct);
}

const standardInputReader = require("node:fs");
const rawData = standardInputReader.readFileSync("/dev/stdin", "utf8");

processFactorialDivisors(rawData);