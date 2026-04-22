(function(rawInput) {
    const numeralData = rawInput.trim().split(/\s+/).map(Number);
    const limitVal = numeralData[0];
    const countVal = numeralData[1];

    const derivedLimit = limitVal - countVal + 1;
    const primeModulus = 1000000007;

    const additiveSum = (firstTerm, secondTerm) => (firstTerm + secondTerm) % primeModulus;

    const productOfTerms = (factorA, factorB) => {
        let currentResult = 0;
        factorA %= primeModulus;
        factorB %= primeModulus;
        while (factorB > 0) {
            if (factorB & 1) {
                currentResult = additiveSum(currentResult, factorA);
            }
            factorA = additiveSum(factorA, factorA);
            factorB >>= 1;
        }
        return currentResult;
    };

    const powerElevator = (base, exponent) => {
        let finalPower = 1;
        base %= primeModulus;
        while (exponent > 0) {
            if (exponent % 2 === 1) finalPower = productOfTerms(finalPower, base);
            base = productOfTerms(base, base);
            exponent = Math.floor(exponent / 2);
        }
        return finalPower;
    };

    const inverseFactor = (num) => powerElevator(num, primeModulus - 2);

    const factorialRegistry = new Array(limitVal + 1);
    const invFactorialRegistry = new Array(limitVal + 1);
    factorialRegistry[0] = 1;
    invFactorialRegistry[0] = 1;
    for (let idx = 1; idx <= limitVal; ++idx) {
        factorialRegistry[idx] = productOfTerms(factorialRegistry[idx - 1], idx);
        invFactorialRegistry[idx] = inverseFactor(factorialRegistry[idx]);
    }

    const binomialCoefficient = (upper, lower) => {
        if (lower < 0 || lower > upper) return 0;
        return productOfTerms(factorialRegistry[upper], productOfTerms(invFactorialRegistry[lower], invFactorialRegistry[upper - lower]));
    };

    const finalResults = Array.from({ length: countVal }, (_, index) => {
        const counter = index + 1;
        return productOfTerms(binomialCoefficient(derivedLimit, counter), binomialCoefficient(countVal - 1, counter - 1));
    });

    console.log(finalResults.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));