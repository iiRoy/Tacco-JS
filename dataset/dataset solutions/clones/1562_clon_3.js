const obtainPrimesUpTo = (limitVal) => {
    // Guard against invalid or small limits; primes start from 2.
    if (limitVal < 2) {
        return [];
    }

    // Initialize a boolean array; `true` indicates a number is potentially prime.
    // The array size is `limitVal + 1` to allow direct indexing up to `limitVal`.
    const isComposite = new Array(limitVal + 1).fill(false); // Initially, assume all are prime (not composite)
    isComposite[0] = true; // 0 is not prime
    isComposite[1] = true; // 1 is not prime

    // Iterate from 2 up to the square root of the limit.
    // Numbers whose multiples are marked as composite will be found by this point.
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= limitVal; currentCandidate++) {
        // If currentCandidate is still marked as not composite (i.e., prime)
        if (!isComposite[currentCandidate]) {
            // Mark all multiples of currentCandidate as composite.
            // Start marking from currentCandidate * currentCandidate for efficiency,
            // as smaller multiples would have already been marked by smaller primes.
            for (let multiple = currentCandidate * currentCandidate; multiple <= limitVal; multiple += currentCandidate) {
                isComposite[multiple] = true;
            }
        }
    }

    // Collect all numbers that remain marked as not composite into the final list.
    const resultingPrimeNumbers = [];
    for (let num = 2; num <= limitVal; num++) {
        if (!isComposite[num]) {
            resultingPrimeNumbers.push(num);
        }
    }
    return resultingPrimeNumbers;
};


const decomposeIntoPrimeFactors = (inputNumber, availablePrimes) => {
    // Return an empty object for numbers less than or equal to 1, as they have no prime factors.
    if (inputNumber <= 1) {
        return {};
    }

    // Use a temporary variable to perform divisions without altering the original input.
    let tempValue = inputNumber;
    // An object to store the frequency of each prime factor.
    const primeFactorOccurrences = {};

    // Iterate through the provided list of prime numbers.
    for (const currentPrime of availablePrimes) {
        // Optimization: If the square of the current prime exceeds the remaining value,
        // and the remaining value is still greater than 1, then the remaining value
        // must itself be a prime number. We can break and add it directly.
        if (currentPrime * currentPrime > tempValue) {
            break;
        }

        // Continuously divide by the current prime as long as it's a factor.
        while (tempValue % currentPrime === 0) {
            // Increment the count for this prime factor. If not present, initialize to 0 then increment.
            primeFactorOccurrences[currentPrime] = (primeFactorOccurrences[currentPrime] || 0) + 1;
            tempValue /= currentPrime; // Reduce the number by the factor.
        }

        // If the number has been reduced to 1, all prime factors have been found.
        if (tempValue === 1) {
            break;
        }
    }

    // After the loop, if tempValue is still greater than 1, it means it's a prime factor itself.
    // This handles cases where the largest prime factor is greater than sqrt(inputNumber)
    // or if the inputNumber itself is a prime.
    if (tempValue > 1) {
        primeFactorOccurrences[tempValue] = (primeFactorOccurrences[tempValue] || 0) + 1;
    }

    return primeFactorOccurrences;
};


const calculateGreatestCommonDivisor = (valA, valB) => {
    // Ensure inputs are non-negative integers for the standard Euclidean algorithm.
    // `Math.abs` handles negative numbers, `Math.floor` handles decimals.
    let numberOne = Math.abs(Math.floor(valA));
    let numberTwo = Math.abs(Math.floor(valB));

    // Base cases for the Euclidean algorithm.
    // GCD(X, 0) = X
    if (numberTwo === 0) {
        return numberOne;
    }
    if (numberOne === 0) {
        return numberTwo;
    }

    // Implement the Euclidean algorithm iteratively.
    // While the second number is not zero, continue finding remainders.
    while (numberTwo !== 0) {
        let remainder = numberOne % numberTwo;
        numberOne = numberTwo;
        numberTwo = remainder;
    }
    // When numberTwo becomes 0, numberOne holds the GCD.
    return numberOne;
};


const processInputData = (rawInputContent) => {
    // Perform initial validation on the input string.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Input content is empty or invalid.");
        return;
    }

    const contentLines = rawInputContent.trim().split("\n");

    // Expect at least two lines: one for count, one for numbers.
    if (contentLines.length < 2) {
        console.error("Error: Insufficient data lines in input.");
        return;
    }

    // Parse the first line to get the total count of numbers.
    const totalNumbersExpected = Number(contentLines[0]);
    if (isNaN(totalNumbersExpected) || totalNumbersExpected <= 0) {
        console.error("Error: Invalid or non-positive count of numbers provided.");
        return;
    }

    // Parse the second line to get the actual sequence of numbers.
    const numericSequence = contentLines[1].split(" ").map(Number);

    // Validate the parsed numeric sequence.
    if (numericSequence.some(isNaN) || numericSequence.length !== totalNumbersExpected) {
        console.error("Error: The provided number sequence is malformed or its length does not match the count.");
        return;
    }

    // Define the upper bound for prime calculations, based on problem constraints.
    // Adding 1 to accommodate array indexing up to the maximum value.
    const MAXIMUM_ELEMENT_VALUE_PLUS_ONE = 1_000_000 + 1;

    // Generate a list of all prime numbers up to the maximum possible element value.
    const precomputedPrimes = obtainPrimesUpTo(MAXIMUM_ELEMENT_VALUE_PLUS_ONE - 1);

    // --- Phase 1: Check for Pairwise Coprimality ---
    // A flag to track if the entire sequence is pairwise coprime.
    let isEntirelyPairwiseCoprime = true;
    // An efficient array (Uint8Array for 0/1 flags) to mark prime factors encountered so far.
    // Index represents a prime, value 1 means it has appeared in at least one number.
    const primeDivisorPresenceMap = new Uint8Array(MAXIMUM_ELEMENT_VALUE_PLUS_ONE);

    // Iterate through each number in the input sequence.
    for (const currentElement of numericSequence) {
        // Find the prime factors for the current number.
        const elementFactors = decomposeIntoPrimeFactors(currentElement, precomputedPrimes);
        // Extract unique prime divisors as numbers.
        const uniqueDivisors = Object.keys(elementFactors).map(Number);

        // For each unique prime divisor of the current element:
        for (const primeDivisor of uniqueDivisors) {
            // If this prime divisor has already been seen in a *previous* element,
            // then the set of numbers is not pairwise coprime.
            if (primeDivisorPresenceMap[primeDivisor] === 1) {
                isEntirelyPairwiseCoprime = false;
                break; // No need to check further divisors for this element.
            }
            // Mark this prime divisor as seen.
            primeDivisorPresenceMap[primeDivisor] = 1;
        }

        // If we've already determined that they are not pairwise coprime,
        // we can exit this outer loop early.
        if (!isEntirelyPairwiseCoprime) {
            break;
        }
    }

    // If pairwise coprimality holds, print the result and exit.
    if (isEntirelyPairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }

    // --- Phase 2: Check for Setwise Coprimality (only if not pairwise coprime) ---
    // Calculate the Greatest Common Divisor (GCD) of all numbers in the sequence.
    // Initialize the overall GCD with the first element.
    let cumulativeGCD = numericSequence[0];
    // Iterate from the second element onwards, updating the GCD.
    for (let idx = 1; idx < numericSequence.length; idx++) {
        cumulativeGCD = calculateGreatestCommonDivisor(cumulativeGCD, numericSequence[idx]);
        // Optimization: If the cumulative GCD becomes 1 at any point, it cannot decrease further,
        // so we know they are setwise coprime.
        if (cumulativeGCD === 1) {
            break;
        }
    }

    // If the final cumulative GCD of all numbers is 1, they are setwise coprime.
    if (cumulativeGCD === 1) {
        console.log("setwise coprime");
        return;
    }

    // If neither pairwise nor setwise coprime, then they are simply "not coprime".
    console.log("not coprime");
};

// Execute the main processing logic by reading input from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));