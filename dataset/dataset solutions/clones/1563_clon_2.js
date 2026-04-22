const ComputePrimesUpTo = (upperLimit) => {
    // Initialize a numerical array to flag composite numbers; 0 indicates potentially prime, 1 indicates composite.
    let numberStatusFlags = (new Array(upperLimit)).fill(0);
    // A collection to hold the prime numbers identified by this process.
    let identifiedPrimes = [];

    // Iterate through numbers starting from 2. The loop continues as long as the square of the current number
    // does not exceed the provided upper limit.
    for (let currentNumber = 2; currentNumber * currentNumber <= upperLimit; currentNumber++) {
        // If the current number's flag is 0 (meaning it has not been marked as composite yet)
        if (!numberStatusFlags[currentNumber]) {
            // This number is prime; add it to our list of identified primes.
            identifiedPrimes.push(currentNumber);
            // Now, mark all multiples of this prime as composite. The inner loop's condition
            // (`multiple * multiple <= upperLimit`) is specific to this implementation's behavior.
            for (let multiple = currentNumber; multiple * multiple <= upperLimit; multiple += currentNumber) {
                numberStatusFlags[multiple] = 1; // Set the flag to 1, indicating composite.
            }
        }
    }
    // This function returns a list of primes whose squares are less than or equal to the upperLimit,
    // reflecting the exact behavior of the original Sieve-like implementation.
    return identifiedPrimes;
};

const DeterminePrimeFactors = (inputVal, primeCandidates) => {
    // An object to store the unique prime factors found for the input value.
    // Keys will be the prime factors, values will be 1 (indicating presence).
    let factorPresenceMap = {};

    // Iterate through the list of pre-computed prime candidates.
    primeCandidates.some(singlePrime => {
        // If the input value becomes smaller than the current prime,
        // no larger primes from the list can be its factor.
        if (inputVal < singlePrime) return true; // Stop iterating (return true for `some`).

        // If the current prime candidate divides the input value evenly.
        if (inputVal % singlePrime === 0) {
            factorPresenceMap[singlePrime] = 1; // Mark this prime as a factor.
        }
        return false; // Continue iterating (return false for `some`).
    });

    // After checking against the candidate primes, if the input value is still greater than 1,
    // it means the remaining value itself is a prime factor (or a product of primes
    // larger than those in `primeCandidates`, due to the limited prime list).
    if (inputVal > 1) {
        factorPresenceMap[inputVal] = 1; // Add this remaining value as a factor.
    }
    return factorPresenceMap;
};


const ComputeGreatestCommonDivisor = (valueA, valueB) => {
    // Base case: If the second value is zero, the GCD is the first value.
    if (valueB === 0) return valueA;
    // Base case: If the first value is zero, the GCD is the second value.
    else if (valueA === 0) return valueB;
    // Recursive step using the Euclidean algorithm: GCD(a, b) = GCD(b, a % b).
    return ComputeGreatestCommonDivisor(valueB, valueA % valueB);
};

const ProcessDataStream = (textInput) => {
    // Extract the count of numbers from the first line of the input string.
    const elementCount = Number(textInput.split("\n")[0]);
    // Parse the array of numbers from the second line of the input string.
    const numberSequence = textInput.split("\n")[1].split(" ").map(Number);

    // Define the maximum possible value for numbers in the sequence plus one,
    // used as an upper limit for prime generation and factor tracking.
    const topValueBoundary = 10 ** 6 + 1;

    // Generate a list of primes up to the square root of `topValueBoundary` using our custom sieve.
    const primeListForFactoring = ComputePrimesUpTo(topValueBoundary);
    // Initialize an array to keep track of whether any prime factor has been seen across multiple numbers.
    let primeFactorOccurrence = [...new Array(topValueBoundary)].fill(0);
    // A boolean flag to indicate if all numbers in the sequence are pairwise mutually prime.
    let areElementsPairwiseCoprime = true;

    // Iterate through each number in the input number sequence.
    for (let sequenceIndex = 0; sequenceIndex < elementCount; sequenceIndex++) {
        // Determine the prime factors for the current number in the sequence.
        const currentNumberPrimeFactors = Object.keys(DeterminePrimeFactors(numberSequence[sequenceIndex], primeListForFactoring));
        // Iterate through each prime factor found for the current number.
        for (let factorIdx = 0; factorIdx < currentNumberPrimeFactors.length; factorIdx++) {
            // If this prime factor has already been encountered from a previous number.
            if (primeFactorOccurrence[currentNumberPrimeFactors[factorIdx]] === 1) {
                areElementsPairwiseCoprime = false; // The numbers are not pairwise coprime.
            }
            // Mark this prime factor as having been seen.
            primeFactorOccurrence[currentNumberPrimeFactors[factorIdx]] = 1;
        }
    }

    // If the flag indicates they are pairwise coprime, print the corresponding message and exit.
    if (areElementsPairwiseCoprime) {
        console.log("all elements mutually prime");
        return;
    }

    // If not pairwise coprime, proceed to check if they are setwise coprime (their overall GCD is 1).
    let cumulativeGCD = 0; // Initialize an accumulator for the GCD calculation.
    // Compute the GCD of all numbers in the sequence.
    for (let sequenceIndex = 0; sequenceIndex < numberSequence.length; sequenceIndex++) {
        cumulativeGCD = ComputeGreatestCommonDivisor(cumulativeGCD, numberSequence[sequenceIndex]);
    }

    // If the cumulative GCD of all numbers is 1, they are setwise coprime.
    if (cumulativeGCD === 1) {
        console.log("overall set is coprime");
        return;
    }

    // If neither pairwise nor setwise coprime, print the final outcome.
    console.log("not coprime as a set");
};

// Execute the main processing function by reading input from standard input stream.
ProcessDataStream(require("node:fs").readFileSync("/dev/stdin", "utf8"));