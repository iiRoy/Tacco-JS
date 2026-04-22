// This module processes numerical data from standard input to calculate a product based on prime factor frequencies.

function processInputData(rawDataString) {
    // A. Input Parsing and Initial Validation
    // Extract the first line of input, which should contain the two primary numbers.
    const inputLines = rawDataString.split('\n');
    if (inputLines.length === 0 || !inputLines[0]) {
        console.error("Error: No input data provided.");
        return; // Exit if no valid input line.
    }

    const firstDataRow = inputLines[0];
    const numberStrings = firstDataRow.split(' ');

    if (numberStrings.length < 2) {
        console.error("Error: Insufficient numbers in the input line. Expected two integers.");
        return; // Exit if not enough numbers.
    }

    // Parse the two essential numerical parameters.
    const requiredCountThreshold = Number(numberStrings[0]); // Corresponds to N from original problem
    const targetNumber = Number(numberStrings[1]); // Corresponds to P from original problem

    // Validate parsed numbers.
    if (!Number.isInteger(requiredCountThreshold) || requiredCountThreshold <= 0) {
        console.error("Error: First input number (requiredCountThreshold) must be a positive integer.");
        return;
    }
    if (!Number.isInteger(targetNumber) || targetNumber < 0) { // Target number can be 0 or 1
        console.error("Error: Second input number (targetNumber) must be a non-negative integer.");
        return;
    }

    // B. Handle specific edge cases for the targetNumber
    if (targetNumber === 0) {
        console.log(0); // For 0, the product of factors is typically considered 0.
        return;
    }
    // If targetNumber is 1, it has no prime factors. The frequency map will be empty.
    // The final product will correctly remain 1, which is the desired output for P=1.
    // Therefore, no special early exit for targetNumber === 1 is needed here; the general logic handles it.

    // D. Prime Factorization Logic
    // This function determines the prime factors of a given number.
    // It employs a combination of direct division for small primes (2, 3, 5) and
    // a wheel factorization (6k +/- 1 pattern) for larger prime candidates to optimize performance.
    const extractPrimeDivisors = (valueToFactor) => {
        const factors = [];
        let currentNum = valueToFactor;

        // --- Phase 1: Extract all factors of 2 ---
        while (currentNum > 1 && currentNum % 2 === 0) {
            factors.push(2);
            currentNum /= 2;
        }

        // --- Phase 2: Extract all factors of 3 ---
        while (currentNum > 1 && currentNum % 3 === 0) {
            factors.push(3);
            currentNum /= 3;
        }

        // --- Phase 3: Extract all factors of 5 ---
        while (currentNum > 1 && currentNum % 5 === 0) {
            factors.push(5);
            currentNum /= 5;
        }

        // --- Phase 4: Optimized loop for primes greater than 5 ---
        // This uses the 6k +/- 1 pattern, skipping multiples of 2, 3, and 5.
        // `candidateDivisor` starts at 7. `incrementStep` alternates between 4 and 2.
        // Example sequence of candidateDivisor: 7, 11, 13, 17, 19, 23, 29, 31, ...
        let candidateDivisor = 7;
        let incrementStep = 4; // Initial step in the 6k +/- 1 wheel

        // Optimization: only check divisors up to the square root of the remaining number.
        // This limit needs to be re-evaluated if `currentNum` changes significantly.
        let upperFactorLimit = Math.sqrt(currentNum);

        while (candidateDivisor <= upperFactorLimit) {
            if (currentNum % candidateDivisor === 0) {
                factors.push(candidateDivisor);
                currentNum /= candidateDivisor;
                // If a factor is found, reset candidateDivisor and incrementStep to restart
                // the search from the beginning of the wheel. This ensures all occurrences
                // of the current factor are captured and the `upperFactorLimit` is correct
                // for the newly reduced `currentNum`.
                candidateDivisor = 7;
                incrementStep = 4;
                upperFactorLimit = Math.sqrt(currentNum); // Recalculate limit for the new currentNum
            } else {
                candidateDivisor += incrementStep;
                incrementStep = 6 - incrementStep; // Alternates between 4 and 2
            }
        }

        // If `currentNum` is still greater than 1 after all divisions, it means
        // the remaining `currentNum` itself is a prime factor (larger than 5).
        if (currentNum > 1) {
            factors.push(currentNum);
        }

        return factors;
    };

    // Obtain the complete list of prime factors for the target number.
    const allPrimeFactors = extractPrimeDivisors(targetNumber);

    // E. Calculate Frequency of Each Prime Factor
    // A Map is used for storing factor frequencies, offering better performance
    // and a cleaner API compared to a plain JavaScript object, especially for many unique factors.
    const factorFrequencyMap = new Map();
    for (const singleFactor of allPrimeFactors) {
        // Increment the count for the current factor, or initialize it to 1 if it's the first occurrence.
        factorFrequencyMap.set(singleFactor, (factorFrequencyMap.get(singleFactor) || 0) + 1);
    }

    // F. Calculate the Final Product
    let finalProductResult = 1;

    // Iterate through the unique prime factors and their associated counts stored in the map.
    factorFrequencyMap.forEach((count, primeFactor) => {
        // If a prime factor's count meets or exceeds the 'requiredCountThreshold',
        // it is included in the final product.
        if (count >= requiredCountThreshold) {
            finalProductResult *= primeFactor;
        }
    });

    // Output the computed result to standard output.
    console.log(finalProductResult);
}

// Entry point for the script: This line reads the entire content from standard input
// (typically '/dev/stdin' in competitive programming environments) as a UTF-8 string
// and passes it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));