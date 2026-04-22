// This utility function determines the prime factorization of a given positive integer.
// It returns an array of objects, where each object represents a prime base and its corresponding exponent.
function extractPrimeExponents(inputVal) {
    // Input validation: prime factorization is typically for integers greater than or equal to 2.
    if (inputVal < 2) {
        // For numbers less than 2, there are no prime factors in the conventional sense.
        // Returning an empty array is a reasonable default behavior for this context.
        return [];
    }

    // A list to store the prime factors and their associated powers.
    // Each entry will be an object like { primeBase: 2, powerValue: 3 } meaning 2^3.
    const primeFactorsList = [];
    // We'll modify a copy of the input value as we find and divide out factors,
    // preserving the original inputVal if needed elsewhere (though not in this specific use case).
    let remainingValue = inputVal;

    // Start checking for divisibility from the smallest prime, 2.
    // We only need to check potential divisor candidates up to the square root of the remaining value.
    // This optimization is based on the fact that if a number has a prime factor greater than its square root,
    // it must also have a prime factor smaller than its square root, which would have been found already.
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= remainingValue; divisorCandidate++) {
        let currentExponentCount = 0; // Initialize exponent for the current candidate prime.

        // Continuously divide by divisorCandidate as long as it cleanly divides the remainingValue.
        // This ensures we find all occurrences of a prime factor.
        while (remainingValue % divisorCandidate === 0) {
            remainingValue /= divisorCandidate; // Reduce the number by dividing out the factor.
            currentExponentCount++;           // Increment the exponent for this prime base.
        }

        // If divisorCandidate was indeed a factor (i.e., currentExponentCount > 0),
        // record it in our list of prime factors with its accumulated power.
        if (currentExponentCount > 0) {
            primeFactorsList.push({ primeBase: divisorCandidate, powerValue: currentExponentCount });
        }
    }

    // After the loop, if remainingValue is still greater than 1,
    // it means the remainingValue itself is a prime number. This prime factor
    // must be greater than the square root of the original inputVal (or the final remainingValue).
    if (remainingValue > 1) {
        primeFactorsList.push({ primeBase: remainingValue, powerValue: 1 });
    }

    // Return the complete list of prime factors and their powers for the original input number.
    return primeFactorsList;
}


// This function orchestrates the calculation of the total number of divisors for N! (N factorial),
// applying modulo arithmetic to keep the result within manageable bounds.
// It takes the input N as a string, parses it, and then performs the necessary computations.
function processFactorialDivisors(inputData) {
    // Attempt to convert the input string to a numerical upper limit.
    // Using parseInt with radix 10 ensures proper conversion for base-10 numbers.
    const upperLimit = parseInt(inputData.trim(), 10);

    // Basic input validation: ensure the parsed value is a valid non-negative integer.
    // Factorials are typically defined for non-negative integers.
    if (isNaN(upperLimit) || upperLimit < 0) {
        console.error("Input Error: Please provide a valid non-negative integer for the upper limit.");
        // In a real application, one might throw an exception or handle this more robustly.
        return;
    }

    // Define a large prime number for modulo operations.
    // This is crucial for preventing integer overflow when dealing with large products,
    // common in combinatorial problems and competitive programming.
    // Numeric separators (ES2021) enhance readability for large numbers.
    const moduloConstant = 1_000_000_007;

    // A Map to store the cumulative prime factors and their total exponents for N!.
    // For example, if N=3, N! = 6 = 2^1 * 3^1. The map would contain {2: 1, 3: 1}.
    // Using a Map provides better performance for arbitrary keys than a plain object for frequent additions.
    const cumulativePrimePowers = new Map();

    // Iterate through each number from 1 up to the upper limit (N).
    // For each currentNumber, find its prime factorization and then accumulate the exponents
    // into the cumulativePrimePowers map.
    for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
        // The number 1 has no prime factors that contribute to the product of primes.
        // Skipping it avoids unnecessary processing and maintains mathematical correctness.
        if (currentNumber === 1) {
            continue; // Move to the next iteration in the loop.
        }

        // Obtain the prime factorization for the current number using our helper function.
        // This returns an array of objects like [{ primeBase: 2, powerValue: 1 }, { primeBase: 3, powerValue: 1 }] for 6.
        const intermediateFactors = extractPrimeExponents(currentNumber);

        // Iterate over each prime factor found for 'currentNumber'.
        intermediateFactors.forEach(factorEntry => {
            const prime = factorEntry.primeBase;     // Extract the prime base (e.g., 2, 3, 5).
            const exponent = factorEntry.powerValue; // Extract its power (e.g., 1, 2, 3).

            // Update the cumulative exponent for this prime in our map.
            // If the prime already exists in the map, add the new exponent to the existing one.
            // If it's a new prime, initialize its exponent with the current value.
            // The `|| 0` handles the case where `get(prime)` returns `undefined` for new primes.
            cumulativePrimePowers.set(prime, (cumulativePrimePowers.get(prime) || 0) + exponent);
        });
    }

    // Optional: Log the accumulated prime factors and their exponents for debugging or inspection.
    // This provides a clear insight into the prime factorization of N!.
    // Object.fromEntries converts the Map back to a plain object for console display.
    console.log(`Prime factorization of ${upperLimit}! (accumulated exponents):`, Object.fromEntries(cumulativePrimePowers));

    // Initialize the total count of divisors.
    // The number of divisors for a number P1^e1 * P2^e2 * ... * Pk^ek is calculated by the product:
    // (e1+1) * (e2+1) * ... * (ek+1).
    let totalDivisorCount = 1;

    // Iterate over the accumulated prime factor exponents in the map.
    // We only need the values (exponents) to compute the number of divisors.
    for (const exponentValue of cumulativePrimePowers.values()) {
        // Apply the (exponent + 1) rule for each unique prime factor.
        // This term represents the number of choices for the power of that specific prime factor in a divisor.
        const termForPrime = (exponentValue + 1);

        // Multiply the running totalDivisorCount by the new term and apply the modulo constant.
        // The modulo operation is performed at each multiplication to prevent intermediate results from overflowing.
        totalDivisorCount = (totalDivisorCount * termForPrime) % moduloConstant;
    }

    // Output the final computed number of divisors for N! modulo the specified constant.
    console.log(`Total number of divisors for ${upperLimit}! (modulo ${moduloConstant}):`, totalDivisorCount);
}

// Entry point of the script: Read input from standard input and pass it to the main processing function.
// This setup is typical for command-line execution in environments like Node.js,
// where '/dev/stdin' is used to read input piped from another process or typed by the user.
processFactorialDivisors(require("fs").readFileSync("/dev/stdin", "utf8"));