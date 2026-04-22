function processInputData(rawDataString) {
    // This function takes a raw string input, processes it according to specific rules
    // involving prime factorization and exponentiation, and outputs a final sum modulo a large prime.
    // It is a Type III clone, demonstrating extensive renaming, structural changes,
    // additions of helper functions/variables, and updates to existing logic.

    // --- Constants and Global Settings ---
    // Define the upper limit for prime factor candidates.
    // The original code used 1000001 as an array size, implying factors up to 1000000.
    const MAX_PRIME_CANDIDATE_LIMIT = 1000000;
    // Define the modulo value for the final result, as specified by the problem.
    const RESULT_MODULO_VALUE = 10 ** 9 + 7;

    // Helper function for modular exponentiation (a new fragment for robustness)
    // This prevents intermediate products from exceeding JavaScript's safe integer limit
    // when calculating (base ^ exponent) % modulus.
    const calculateModularPower = (base, exponent, modulus) => {
        let result = 1;
        // Ensure base is within the modulus range (positive remainder)
        base = base % modulus;
        if (base < 0) base += modulus; // Handle negative bases if applicable (not here)

        while (exponent > 0) {
            // If exponent is odd, multiply result by base
            if (exponent % 2 === 1) {
                result = (result * base) % modulus;
            }
            // Square the base and halve the exponent
            base = (base * base) % modulus;
            exponent = Math.floor(exponent / 2);
        }
        return result;
    };

    // --- Input Parsing and Initial Setup ---
    // Split the raw input string into individual lines
    const inputLines = rawDataString.trim().split("\n");

    // Retrieve the count of numbers to process from the first line
    const totalInputNumbers = parseInt(inputLines[0], 10);

    // Guard clause: Validate the number of inputs. If invalid, output 0 or an error.
    if (isNaN(totalInputNumbers) || totalInputNumbers <= 0) {
        console.log(0);
        return;
    }

    // Parse the actual numbers from the second line, converting them to integers.
    let numericInputValues = inputLines[1].split(' ').map(str => parseInt(str, 10));

    // Ensure the array of numbers matches the declared totalInputNumbers.
    // This adds robustness by truncating or padding the array if it's mismatched.
    if (numericInputValues.length < totalInputNumbers) {
        // Pad with default value (e.g., 1, as it has no prime factors > 1) if not enough numbers
        while (numericInputValues.length < totalInputNumbers) {
            numericInputValues.push(1);
        }
    } else if (numericInputValues.length > totalInputNumbers) {
        // Truncate if more numbers are provided than declared
        numericInputValues = numericInputValues.slice(0, totalInputNumbers);
    }

    // Initialize a 2D array to store the count of each prime factor for each input number.
    // Example: primeFactorCounts[i][p] stores how many times prime 'p' divides numericInputValues[i].
    // Using Array.from and .fill(0) for cleaner initialization.
    const primeFactorCounts = Array.from({ length: totalInputNumbers }, () =>
        new Array(MAX_PRIME_CANDIDATE_LIMIT + 1).fill(0)
    );

    // Initialize another 2D array to store the 'adjusted' or 'required' exponents for each prime factor.
    // This will hold the minimum additional factors needed for each number.
    const requiredAdjustedExponents = Array.from({ length: totalInputNumbers }, () =>
        new Array(MAX_PRIME_CANDIDATE_LIMIT + 1).fill(0)
    );

    // Use a Set to efficiently collect all unique prime factors encountered across all numbers.
    // This replaces the original string concatenation and splitting logic.
    const encounteredPrimesSet = new Set();

    // Create a mutable copy of the input numbers for factorization, as they will be modified.
    let workingNumbersForFactorization = [...numericInputValues];

    // --- Phase 1: Prime Factorization for Each Input Number ---
    // Iterate through each number to find its prime factors and their counts.
    for (let elementIndex = 0; elementIndex < totalInputNumbers; elementIndex++) {
        let currentNumberBeingFactored = workingNumbersForFactorization[elementIndex];

        // Skip factorization for numbers that are 0, 1, or negative (handle as 1 for factors > 1)
        if (currentNumberBeingFactored <= 1) {
            continue;
        }

        // Iterate through possible prime factors from 2 up to the defined limit.
        for (let candidateFactor = 2; candidateFactor <= MAX_PRIME_CANDIDATE_LIMIT; candidateFactor++) {
            // Check if the current candidateFactor divides the number.
            if (currentNumberBeingFactored % candidateFactor === 0) {
                // If it's a factor, record it in our set of unique primes.
                encounteredPrimesSet.add(candidateFactor);

                // Repeatedly divide the number by this factor and increment its count.
                // This 'while' loop replaces the original 'for(k=0; k>=0; k)' structure.
                while (currentNumberBeingFactored % candidateFactor === 0) {
                    primeFactorCounts[elementIndex][candidateFactor]++;
                    currentNumberBeingFactored /= candidateFactor;
                }
            }

            // Optimization: If the number has been reduced to 1, all its factors have been found.
            // This prevents unnecessary checks for larger candidate factors.
            if (currentNumberBeingFactored === 1) {
                break;
            }
        }

        // Post-loop check: If currentNumberBeingFactored is still greater than 1,
        // it means the remaining value is a prime factor larger than MAX_PRIME_CANDIDATE_LIMIT.
        // The original code would effectively ignore this large prime in subsequent steps
        // because `primeFactorCounts` arrays are capped at MAX_PRIME_CANDIDATE_LIMIT.
        // We will mimic this behavior by adding it to the set but not storing its count
        // if it exceeds the array bounds. If it's within bounds (e.g., if MAX_PRIME_CANDIDATE_LIMIT
        // was just 1000 and the number was 1009), we would record it.
        if (currentNumberBeingFactored > 1 && currentNumberBeingFactored <= MAX_PRIME_CANDIDATE_LIMIT) {
             encounteredPrimesSet.add(currentNumberBeingFactored);
             primeFactorCounts[elementIndex][currentNumberBeingFactored]++;
        }
    }

    // Convert the Set of unique primes into a sorted array for consistent iteration.
    // Sorting ensures predictable order, though not strictly necessary for correctness.
    const sortedUniquePrimeFactors = Array.from(encounteredPrimesSet).sort((a, b) => a - b);
    const countOfUniquePrimes = sortedUniquePrimeFactors.length;

    // --- Phase 2: Calculate Required Adjusted Exponents ---
    // This phase determines, for each number and each unique prime factor,
    // how many *additional* factors are needed for that number to match
    // the maximum count of that prime factor found in *any other* number.
    for (let targetElementIndex = 0; targetElementIndex < totalInputNumbers; targetElementIndex++) {
        for (let primeIterator = 0; primeIterator < countOfUniquePrimes; primeIterator++) {
            const currentPrimeValue = sortedUniquePrimeFactors[primeIterator];
            let highestNeededExponentForThisPrime = 0; // Tracks the maximum difference found

            // Get the current count of this prime in the target element.
            const targetElementPrimeCount = primeFactorCounts[targetElementIndex][currentPrimeValue] || 0;

            // Compare with all other elements.
            for (let comparisonElementIndex = 0; comparisonElementIndex < totalInputNumbers; comparisonElementIndex++) {
                // Skip self-comparison.
                if (targetElementIndex === comparisonElementIndex) {
                    continue;
                }

                // Get the prime count in the comparison element.
                const comparisonElementPrimeCount = primeFactorCounts[comparisonElementIndex][currentPrimeValue] || 0;

                // Calculate the difference: how many more factors does the target element need
                // to reach the comparison element's count?
                const requiredDifference = comparisonElementPrimeCount - targetElementPrimeCount;

                // Update the highest needed exponent if this difference is greater.
                // This effectively finds max(0, max_over_other_elements(comparison_count - target_count)).
                highestNeededExponentForThisPrime = Math.max(highestNeededExponentForThisPrime, requiredDifference);
            }
            // Store the calculated highest needed exponent for the current target element and prime.
            requiredAdjustedExponents[targetElementIndex][currentPrimeValue] = highestNeededExponentForThisPrime;
        }
    }

    // --- Phase 3: Calculate Final Products and Sum ---
    // Initialize an array to store the final product for each input number,
    // and a variable for the cumulative sum of these products.
    const individualElementProducts = new Array(totalInputNumbers).fill(1);
    let cumulativeGrandTotal = 0;

    // Iterate through each element to compute its final product.
    for (let elementResultIndex = 0; elementResultIndex < totalInputNumbers; elementResultIndex++) {
        // For each unique prime factor, apply its adjusted exponent if required.
        for (let primeLoopIndex = 0; primeLoopIndex < countOfUniquePrimes; primeLoopIndex++) {
            const currentPrime = sortedUniquePrimeFactors[primeLoopIndex];
            const exponentToApply = requiredAdjustedExponents[elementResultIndex][currentPrime];

            // If an exponent is positive, it means additional factors are needed.
            if (exponentToApply > 0) {
                // Multiply the current element's product by (currentPrime ^ exponentToApply).
                // Use modular exponentiation to keep numbers within safe limits and apply modulo.
                individualElementProducts[elementResultIndex] =
                    (individualElementProducts[elementResultIndex] * calculateModularPower(currentPrime, exponentToApply, RESULT_MODULO_VALUE)) % RESULT_MODULO_VALUE;
            }
        }
        // Add the calculated product for this element to the cumulative sum, applying modulo.
        cumulativeGrandTotal = (cumulativeGrandTotal + individualElementProducts[elementResultIndex]) % RESULT_MODULO_VALUE;
    }

    // Output the final cumulative sum modulo the specified constant.
    console.log(cumulativeGrandTotal);
}

// The entry point for execution, reading input from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));