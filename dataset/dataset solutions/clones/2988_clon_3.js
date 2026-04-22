const processInputData = (inputString) => {
    // Cleans and converts the raw input string into a valid numeric value.
    // Performs basic validation to ensure the input is a positive integer.
    const numericValue = Number(inputString.trim());
    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue < 1) {
        throw new Error("Input data error: Expected a positive integer.");
    }
    return numericValue;
};

const performSieveOfEratosthenes = (upperBoundary) => {
    // Generates a list of prime numbers up to a specified upperBoundary
    // using the Sieve of Eratosthenes algorithm.
    if (upperBoundary < 2) {
        return []; // No prime numbers exist below 2.
    }

    // Initialize an array of boolean flags, assuming all numbers are prime initially.
    const primalityIndicators = new Array(upperBoundary + 1).fill(true);
    primalityIndicators[0] = false; // 0 is not prime.
    primalityIndicators[1] = false; // 1 is not prime.

    // Iterate from 2 up to the square root of the boundary.
    // Numbers whose multiples are marked false are composites.
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= upperBoundary; ++currentCandidate) {
        // If currentCandidate is still marked as prime, then it is a prime number.
        if (primalityIndicators[currentCandidate]) {
            // Mark all multiples of currentCandidate (starting from its square) as not prime.
            // Smaller multiples would have already been handled by smaller prime factors.
            for (let multiple = currentCandidate * currentCandidate; multiple <= upperBoundary; multiple += currentCandidate) {
                primalityIndicators[multiple] = false;
            }
        }
    }

    // Collect all numbers that remain marked as prime.
    const identifiedPrimes = [];
    for (let number = 2; number <= upperBoundary; ++number) {
        if (primalityIndicators[number]) {
            identifiedPrimes.push(number);
        }
    }
    return identifiedPrimes;
};

const decomposeIntoPrimeFactors = (numberToFactorize, availablePrimes) => {
    // Determines the prime factorization of a given number.
    // Returns an array of [prime, exponent] pairs.
    if (numberToFactorize === 1) {
        return []; // 1 has no prime factors.
    }

    let remainingValue = numberToFactorize;
    const factorExponentMap = new Map(); // Stores prime factors and their exponents.

    // Iterate through the list of known primes.
    for (const currentPrime of availablePrimes) {
        // Optimization: If the square of the current prime exceeds the remaining value,
        // then the remaining value must be a prime itself (or 1).
        if (currentPrime * currentPrime > remainingValue) {
            break;
        }

        // Count how many times the current prime divides the remaining value.
        while (remainingValue % currentPrime === 0) {
            factorExponentMap.set(currentPrime, (factorExponentMap.get(currentPrime) || 0) + 1);
            remainingValue /= currentPrime;
        }
    }

    // If, after checking all small primes, remainingValue is still greater than 1,
    // it means remainingValue itself is a large prime factor.
    if (remainingValue > 1) {
        factorExponentMap.set(remainingValue, (factorExponentMap.get(remainingValue) || 0) + 1);
    }

    // Convert the Map entries into an array of [prime, exponent] pairs.
    return Array.from(factorExponentMap.entries());
};

const calculateSumOfSpecialDivisors = (rawInputData) => {
    const originalNumber = processInputData(rawInputData);

    // Special handling for the number 1, as per problem specification.
    if (originalNumber === 1) {
        return 0;
    }

    // Determine the upper limit for generating primes.
    // We need primes up to at least the square root of the original number.
    // Adding 2 provides a safe margin for the sieve.
    const sieveUpperLimit = Math.floor(Math.sqrt(originalNumber)) + 2;
    const primeList = performSieveOfEratosthenes(sieveUpperLimit);

    // Obtain the prime factorization of the original number.
    // This array will contain elements like [base_prime, exponent].
    const factorizationComponents = decomposeIntoPrimeFactors(originalNumber, primeList);

    // Calculate the total count of all divisors.
    // This is the product of (exponent + 1) for each prime factor.
    const totalDivisorCount = factorizationComponents.reduce((acc, currentComponent) => {
        return acc * (currentComponent[1] + 1);
    }, 1);

    let runningSum = 0; // Accumulator for the final result.

    // Iterate through all possible divisors using a mixed-radix number system approach.
    // Each iteration 'divisorIterationIndex' uniquely maps to a divisor of originalNumber.
    for (let divisorIterationIndex = 0; divisorIterationIndex < totalDivisorCount; ++divisorIterationIndex) {
        let temporaryIndex = divisorIterationIndex;
        let currentDivisor = 1; // Start with 1 to build the divisor.

        // For each prime factor and its maximum exponent in the original number:
        for (const [primeBase, maxExponent] of factorizationComponents) {
            // Determine the exponent for 'primeBase' in the current divisor.
            const exponentForCurrentPrime = temporaryIndex % (maxExponent + 1);
            
            // Multiply 'currentDivisor' by 'primeBase' raised to 'exponentForCurrentPrime'.
            currentDivisor *= Math.pow(primeBase, exponentForCurrentPrime);
            
            // Update 'temporaryIndex' for the next prime factor.
            temporaryIndex = Math.floor(temporaryIndex / (maxExponent + 1));
        }

        // Apply the specific condition for summation: (originalNumber / currentDivisor - 1) > currentDivisor.
        // This effectively sums (N/d - 1) for divisors 'd' where d * (d + 1) < N.
        const valueToSum = originalNumber / currentDivisor - 1;
        if (valueToSum > currentDivisor) {
            runningSum += valueToSum;
        }
    }

    return runningSum;
};

// Entry point for execution: Reads input, performs calculation, and prints output.
try {
    // Read input from standard input stream, assuming UTF-8 encoding.
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Execute the main computation logic and display the final result.
    console.log(calculateSumOfSpecialDivisors(fileContent));
} catch (executionError) {
    // In case of any error during processing, log the error message and exit.
    console.error("An operational error occurred:", executionError.message);
    process.exit(1); // Indicate an error by exiting with a non-zero status code.
}