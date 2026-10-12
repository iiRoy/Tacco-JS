function calculateFactorialPrimeExponents(upperBound) {
    const primeTracker = new Array(upperBound + 1).fill(true);
    primeTracker[0] = false;
    primeTracker[1] = false;

    for (let currentNum = 2; currentNum * currentNum <= upperBound; currentNum++) {
        if (primeTracker[currentNum]) {
            for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
                primeTracker[multiple] = false;
            }
        }
    }

    const factorialPrimeBreakdown = {};
    for (let primeCandidate = 2; primeCandidate <= upperBound; primeCandidate++) {
        if (primeTracker[primeCandidate]) {
            let currentPrime = primeCandidate;
            let totalExponent = 0;
            let powerAccumulator = currentPrime;

            while (powerAccumulator <= upperBound) {
                totalExponent += Math.floor(upperBound / powerAccumulator);
                if (upperBound / currentPrime < powerAccumulator) {
                    break;
                }
                powerAccumulator *= currentPrime;
            }
            factorialPrimeBreakdown[currentPrime] = totalExponent;
        }
    }
    return factorialPrimeBreakdown;
}

function primaryExecution(inputString) {
    const limitValue = Number(inputString);
    const modulus = 10**9 + 7;

    const primeExponentsMap = calculateFactorialPrimeExponents(limitValue);

    let divisorCountProduct = 1;
    for (const primeKey in primeExponentsMap) {
        if (Object.prototype.hasOwnProperty.call(primeExponentsMap, primeKey)) {
            const exponentValue = primeExponentsMap[primeKey];
            divisorCountProduct = (divisorCountProduct * (exponentValue + 1)) % modulus;
        }
    }
    console.log(divisorCountProduct);
}

primaryExecution(require("fs").readFileSync("/dev/stdin", "utf8"));
