const generatePrimesUpTo = (upperLimit) => {
    // Initialize an array to mark composite numbers.
    // A value of 0 indicates a potentially prime number, 1 indicates a composite number.
    let compositeMarkers = (new Array(upperLimit + 1)).fill(0);
    // This list will store prime numbers identified by the specific sieve implementation.
    let smallPrimes = [];

    // Iterate through numbers starting from 2 up to the square root of the upper limit.
    // The outer loop condition `currentCandidate * currentCandidate <= upperLimit` is critical
    // for replicating the original algorithm's behavior.
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= upperLimit; currentCandidate++) {
        // If the current number has not been marked as composite.
        if (!compositeMarkers[currentCandidate]) {
            // Add this number to our list of primes.
            smallPrimes.push(currentCandidate);

            // Mark multiples of the current prime as composite.
            // The inner loop condition `multipleMarker * multipleMarker <= upperLimit` and
            // starting `multipleMarker` from `currentCandidate` itself are specific to the original code's logic.
            for (let multipleMarker = currentCandidate; multipleMarker * multipleMarker <= upperLimit; multipleMarker += currentCandidate) {
                compositeMarkers[multipleMarker] = 1; // Mark the multiple as composite.
            }
        }
    }
    return smallPrimes; // Return the list of primes found.
};

const decomposeIntoPrimeFactors = (valueToFactor, primeList) => {
    // An object to store the prime factors and their respective counts.
    let factorCounts = {};

    // Iterate through the provided list of primes.
    // The `some` method allows early exit if a condition is met.
    primeList.some(currentPrime => {
        // If the number to factor becomes smaller than the current prime,
        // no further primes from this list can divide it.
        if (valueToFactor < currentPrime) return true; // Stop iterating.

        // Continuously divide `valueToFactor` by `currentPrime` as long as it's divisible.
        while (valueToFactor % currentPrime === 0) {
            // Increment the count for this prime factor. Initialize to 1 if not present.
            factorCounts[currentPrime] = (factorCounts[currentPrime] || 0) + 1;
            valueToFactor /= currentPrime; // Reduce the number.
        }
        return false; // Continue to the next prime in the list.
    });

    // If, after dividing by all primes in `primeList`, `valueToFactor` is still greater than 1,
    // it means the remaining `valueToFactor` is itself a prime factor (or a product of primes
    // not found by the specific `generatePrimesUpTo` function).
    // The original code treats this remaining value as a single prime factor.
    if (valueToFactor > 1) {
        factorCounts[valueToFactor] = 1; // Add the remaining value as a factor with count 1.
    }
    return factorCounts; // Return the map of prime factors and their counts.
};

const computeGreatestCommonDivisor = (firstNumber, secondNumber) => {
    // Base case for the Euclidean algorithm: if the second number is zero,
    // the GCD is the first number.
    if (secondNumber === 0) return firstNumber;
    // Recursive step: GCD(a, b) is equal to GCD(b, a % b).
    return computeGreatestCommonDivisor(secondNumber, firstNumber % secondNumber);
};

const processInputAndDetermineCoprimality = (inputData) => {
    // Parse the total count of numbers from the first line of the input string.
    const numberOfElements = Number(inputData.split("\n")[0]);
    // Parse the array of numbers from the second line of the input string.
    const numericArray = inputData.split("\n")[1].split(" ").map(Number);

    // Generate a list of primes up to the maximum value present in the input array.
    // This uses the specific (and potentially incomplete) sieve implementation.
    const sieveGeneratedPrimes = generatePrimesUpTo(Math.max(...numericArray));
    // An array used to track which prime factors have been encountered across all numbers.
    // The size `numberOfElements` is based on the original code's initialization,
    // which can lead to sparse arrays if prime factors are large.
    let factorPresenceTracker = [...new Array(numberOfElements)].fill(0);
    let arePairwiseCoprime = true; // Flag to indicate if the numbers are pairwise coprime.

    // Iterate through each number in the input array.
    for (let arrayIndex = 0; arrayIndex < numberOfElements; arrayIndex++) {
        // Get the prime factors (as string keys) for the current number.
        const currentNumberFactors = Object.keys(decomposeIntoPrimeFactors(numericArray[arrayIndex], sieveGeneratedPrimes));

        // Iterate through each prime factor of the current number.
        for (let factorIdx = 0; factorIdx < currentNumberFactors.length; factorIdx++) {
            // Check if this prime factor has already been seen in a previous number.
            // The comparison `=== 1` is specific to the original code's use of 0/1 flags.
            if (factorPresenceTracker[currentNumberFactors[factorIdx]] === 1) {
                arePairwiseCoprime = false; // If so, they are not pairwise coprime.
            }
            // Mark this prime factor as seen.
            factorPresenceTracker[currentNumberFactors[factorIdx]] = 1;
        }
    }

    // If the numbers were found to be pairwise coprime, print the result and exit.
    if (arePairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }

    // If not pairwise coprime, proceed to check for setwise coprimality.

    // Calculate the GCD of the first two numbers.
    let overallGCD = computeGreatestCommonDivisor(numericArray[0], numericArray[1]);
    // Calculate the GCD of all numbers in the array by iteratively applying GCD.
    for (let loopIndex = 1; loopIndex < numericArray.length - 1; loopIndex++) {
        overallGCD = computeGreatestCommonDivisor(overallGCD, numericArray[loopIndex + 1]);
    }

    // If the overall GCD of all numbers is 1, they are setwise coprime.
    if (overallGCD === 1) {
        console.log("setwise coprime");
        return;
    }

    // If neither pairwise nor setwise coprime, print "not coprime".
    console.log("not coprime");
};

// Read the input from standard input and execute the main processing logic.
processInputAndDetermineCoprimality(require("fs").readFileSync("/dev/stdin", "utf8"));
