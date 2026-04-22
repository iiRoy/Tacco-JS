((inputData) => {
    // Define the upper boundary for our prime number search.
    // This value is chosen to be different from the original and sufficiently large.
    const SIEVE_UPPER_LIMIT = 60000;

    // Attempt to parse the target count of numbers from the incoming string data.
    let targetCount = parseInt(inputData.trim(), 10);

    // Implement a robust validation for the targetCount.
    // If the parsed value is not a positive integer, assign a sensible default.
    if (isNaN(targetCount) || targetCount <= 0) {
        console.error("Input for target count was invalid or non-positive. Proceeding with a default of 7.");
        targetCount = 7; // Default value in case of bad input
    }

    // Add a protective cap for targetCount to prevent excessive computation
    // or memory usage if an extremely large number is requested.
    // An approximate count of primes below 60000 is 5761.
    const APPROX_MAX_PRIMES_IN_RANGE = 5761;
    if (targetCount > APPROX_MAX_PRIMES_IN_RANGE) {
        console.warn(`Requested quantity (${targetCount}) exceeds practical limits for current sieve. Capping to ${APPROX_MAX_PRIMES_IN_RANGE}.`);
        targetCount = APPROX_MAX_PRIMES_IN_RANGE;
    }

    // Initialize a boolean array to track potential primality using the Sieve of Eratosthenes.
    // 'true' initially means the number is considered prime until proven otherwise.
    let numberStatus = new Array(SIEVE_UPPER_LIMIT + 1);
    for (let idx = 0; idx <= SIEVE_UPPER_LIMIT; idx++) {
        numberStatus[idx] = true;
    }

    // Explicitly mark 0 and 1 as non-prime, as they are not considered prime numbers.
    numberStatus[0] = false;
    numberStatus[1] = false;

    // Execute the Sieve of Eratosthenes algorithm.
    // We only need to iterate up to the square root of the SIEVE_UPPER_LIMIT.
    for (let currentVal = 2; currentVal * currentVal <= SIEVE_UPPER_LIMIT; currentVal++) {
        // If 'currentVal' is still marked as prime, then it is indeed a prime number.
        if (numberStatus[currentVal]) {
            // Mark all multiples of 'currentVal' as not prime.
            // Start marking from currentVal * currentVal for efficiency,
            // as smaller multiples would have already been handled by smaller primes.
            for (let multiple = currentVal * currentVal; multiple <= SIEVE_UPPER_LIMIT; multiple += currentVal) {
                numberStatus[multiple] = false;
            }
        }
    }

    // This array will store the numbers that satisfy both primality and the modulo condition.
    let selectedNumbers = [];

    // Iterate through all numbers within our defined range to find the desired sequence.
    for (let candidate = 2; candidate <= SIEVE_UPPER_LIMIT; candidate++) {
        // First, check if the current number is prime based on our sieve results.
        if (numberStatus[candidate]) {
            // If it's prime, now apply the secondary filter:
            // Check if the prime number leaves a remainder of 1 when divided by 5.
            const moduloRemainder = candidate % 5;
            if (moduloRemainder === 1) {
                // If both criteria are met, add this number to our collection.
                selectedNumbers.push(candidate);

                // If we have accumulated the desired quantity of numbers,
                // we can terminate the search early to save resources.
                if (selectedNumbers.length >= targetCount) {
                    break;
                }
            }
        }
    }

    // Construct the final output string by joining the collected numbers with spaces.
    // If the collection is empty, an empty string will be produced.
    const finalOutput = selectedNumbers.join(' ');

    // Write the resulting string to standard output, followed by a newline character.
    process.stdout.write(finalOutput + '\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8'));