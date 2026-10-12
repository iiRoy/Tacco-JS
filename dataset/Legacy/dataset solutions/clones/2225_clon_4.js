console.log((inputData => {
    const [[countOfNumbers], sourceNumbers] = inputData.trim().split('\n').map(line => line.split(' ').map(value => 0 | value));

    const MOD = 1e9 + 7;
    const MAX = Math.max(...sourceNumbers); // Derived constant, value preserved.

    // Custom modular multiplication using BigInt for intermediate products to ensure precision.
    const modMultiply = (operandA, operandB) => Number((BigInt(operandA) * BigInt(operandB)) % BigInt(MOD));

    const primeFactorExponents = []; // Stores prime factorizations for each number in sourceNumbers
    const overallMaxExponents = new Map(); // Stores the maximum exponent for each prime across all numbers

    // Step 1: Factorize each number and collect overall maximum exponents
    for (let i = 0; i < countOfNumbers; i++) {
        let currentNumber = sourceNumbers[i];
        const currentNumberFactors = new Map();

        // Perform trial division to find prime factors and their exponents
        for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= currentNumber; divisorCandidate++) {
            if (currentNumber % divisorCandidate === 0) {
                let exponentCount = 0;
                while (currentNumber % divisorCandidate === 0) {
                    currentNumber /= divisorCandidate;
                    exponentCount++;
                }
                currentNumberFactors.set(divisorCandidate, exponentCount);
                // Update the overall maximum exponent for this prime
                overallMaxExponents.set(divisorCandidate, Math.max(overallMaxExponents.get(divisorCandidate) || 0, exponentCount));
            }
        }

        // If currentNumber is still greater than 1, it means it's a prime factor itself
        if (currentNumber > 1) {
            currentNumberFactors.set(currentNumber, (currentNumberFactors.get(currentNumber) || 0) + 1);
            overallMaxExponents.set(currentNumber, Math.max(overallMaxExponents.get(currentNumber) || 0, (currentNumberFactors.get(currentNumber) || 0)));
        }
        primeFactorExponents.push(currentNumberFactors);
    }

    let finalSum = 0;

    // Step 2: Calculate the sum based on the collected factorizations and maximum exponents
    for (let i = 0; i < countOfNumbers; i++) {
        let currentTermProduct = 1;
        // Iterate through all primes that were factors of at least one number in sourceNumbers
        for (const [primeBase, globalMaxExp] of overallMaxExponents) {
            const individualExp = primeFactorExponents[i].get(primeBase) || 0;
            const exponentDifference = globalMaxExp - individualExp;

            // Calculate primeBase raised to the power of exponentDifference
            // Math.pow is used directly as intermediate values fit within JavaScript's Number type for these exponents.
            const powerResult = Math.pow(primeBase, exponentDifference);

            currentTermProduct = modMultiply(currentTermProduct, powerResult);
        }
        finalSum = (finalSum + currentTermProduct) % MOD;
    }

    return finalSum;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
