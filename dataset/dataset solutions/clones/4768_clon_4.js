const obtainNumericalValue = () => {
    const rawDataStream = require("fs").readFileSync("/dev/stdin", "utf8");
    return Number(rawDataStream.trim());
};

const presentOutcome = (finalValue) => {
    console.log(finalValue);
};

const calculateFactorialDivisorCount = (maximumValue) => {
    const primeModulus = 1000000007;
    let accumulatedProduct = 1;

    // Step 1: Generate primes up to maximumValue using a sieve method
    const primeCheckArray = Array(maximumValue + 1).fill(true);
    if (maximumValue >= 0) primeCheckArray[0] = false;
    if (maximumValue >= 1) primeCheckArray[1] = false;

    for (let currentIterator = 2; currentIterator * currentIterator <= maximumValue; currentIterator++) {
        if (primeCheckArray[currentIterator]) {
            for (let nonPrimeMark = currentIterator * currentIterator; nonPrimeMark <= maximumValue; nonPrimeMark += currentIterator) {
                primeCheckArray[nonPrimeMark] = false;
            }
        }
    }

    // Step 2: For each prime, calculate its exponent in maximumValue! using Legendre's formula
    // Then multiply (exponent + 1) to the accumulated product, modulo primeModulus
    for (let potentialPrime = 2; potentialPrime <= maximumValue; potentialPrime++) {
        if (primeCheckArray[potentialPrime]) {
            let currentPrimeExponent = 0;
            let currentDivisorPower = potentialPrime;

            while (currentDivisorPower <= maximumValue) {
                currentPrimeExponent += Math.floor(maximumValue / currentDivisorPower);
                // Prevent overflow and ensure currentDivisorPower doesn't exceed maximumValue
                if (currentDivisorPower > maximumValue / potentialPrime) {
                    break;
                }
                currentDivisorPower *= potentialPrime;
            }
            accumulatedProduct = (accumulatedProduct * (currentPrimeExponent + 1)) % primeModulus;
        }
    }
    return accumulatedProduct;
};

const orchestrateExecution = () => {
    const inputValue = obtainNumericalValue();
    const computedResult = calculateFactorialDivisorCount(inputValue);
    presentOutcome(computedResult);
};

orchestrateExecution();