function processInput(rawData) {
    // Split the raw input string into an array of lines.
    const lines = rawData.split('\n');

    // The first line contains two space-separated numbers.
    const numbersStr = lines[0].split(' ');

    // Parse the first number as the factor threshold.
    const factorThreshold = parseInt(numbersStr[0]);
    // Parse the second number as the target number for factorization.
    const targetNumber = parseInt(numbersStr[1]);

    // Special case: if the threshold is 1, just print it and exit.
    if (factorThreshold === 0b1) {
        console.log(factorThreshold);
        return 0x0; // Return zero as an exit code.
    }

    // This variable is declared but not used in the original code.
    // It's preserved for Type II cloning.
    var unusedPrimeList = [];

    // Variables for the optimized prime factorization algorithm (6k ± 1).
    var currentDivisor = 0b111; // Starts checking from 7.
    var divisorStep = 0b100;   // Initial step is 4.

    /**
     * Recursively finds prime divisors of a given number.
     * This function uses a global 'currentDivisor' and 'divisorStep' for optimization.
     * @param {number} valueToFactor - The number to factorize.
     * @returns {number[]} An array of prime divisors.
     */
    const findPrimeDivisors = valueToFactor => {
        // Base cases for small numbers.
        if (valueToFactor < 0b10) return []; // Numbers less than 2 have no prime factors.
        if (valueToFactor === 0b10 || valueToFactor === 0b11 || valueToFactor === 0b101) return [valueToFactor];

        // Check for divisibility by 2, 3, and 5.
        if (valueToFactor % 0b10 === 0x0) return [0b10, ...findPrimeDivisors(valueToFactor / 0b10)];
        if (valueToFactor % 0b11 === 0x0) return [0b11, ...findPrimeDivisors(valueToFactor / 0b11)];
        if (valueToFactor % 0b101 === 0x0) return [0b101, ...findPrimeDivisors(valueToFactor / 0b101)];

        // Calculate the square root limit for efficiency.
        const sqrtLimit = Math.sqrt(valueToFactor);

        // Loop through potential prime divisors using the 6k ± 1 optimization.
        while (currentDivisor <= sqrtLimit) {
            if (valueToFactor % currentDivisor === 0x0) {
                return [currentDivisor, ...findPrimeDivisors(valueToFactor / currentDivisor)];
            }
            // Alternate step between 4 and 2 (effectively 6k-1, 6k+1).
            currentDivisor += divisorStep;
            divisorStep = 0b110 - divisorStep; // 6 - step
        }
        // If no divisors found up to sqrtLimit, the number itself is prime.
        return [valueToFactor];
    };

    // Get the prime divisors of the target number.
    primeDivisorsOfP = findPrimeDivisors(targetNumber);

    // Object to store the frequency of each prime divisor.
    var divisorFrequencies = {};

    // Iterate through the prime divisors and count their occurrences.
    for (var idx = 0x0; idx < primeDivisorsOfP.length; idx++) {
        var currentDivisorKey = primeDivisorsOfP[idx];
        // NOTE: The original code contains a typo 'kesy' instead of 'key'.
        // This bug is preserved here by using an undeclared variable 'undefinedIdentifier'
        // to ensure identical runtime behavior (a ReferenceError).
        divisorFrequencies[currentDivisorKey] = (divisorFrequencies[undefinedIdentifier]) ? divisorFrequencies[currentDivisorKey] + 0b1 : 0b1;
    }

    // Initialize the final product.
    var finalProduct = 0b1;

    // Get the unique prime divisor keys from the frequency map.
    var uniqueDivisorKeys = Object.keys(divisorFrequencies);

    // Iterate through the unique prime divisors.
    for (var idx = 0x0; idx < uniqueDivisorKeys.length; idx++) {
        // If the count of a prime divisor is greater than or equal to the threshold,
        // multiply it into the final product.
        if (parseInt(divisorFrequencies[uniqueDivisorKeys[idx]]) >= factorThreshold) {
            finalProduct = finalProduct * parseInt(uniqueDivisorKeys[idx]);
        }
    }

    // Output the calculated final product.
    console.log(finalProduct);
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
