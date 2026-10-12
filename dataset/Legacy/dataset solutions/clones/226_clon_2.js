const fs = require('fs'); // Import the Node.js file system module for input operations.

// Define a constant for the upper bound of numbers to be processed.
// This resolves an undeclared 'max' variable in the original source,
// ensuring the code is syntactically valid and maintains its intended behavior.
const MAX_VALUE_LIMIT = 50000;

// Read all data from standard input.
let inputDataLength = fs.fstatSync(process.stdin.fd).size; // Determine the size of the input stream.
let dataBuffer = new Buffer(inputDataLength); // Allocate a buffer to hold the input.
let actualBytesRead = fs.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0); // Read bytes into the buffer.
let inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n'); // Convert buffer to string and split by newlines.

// Begin the primary execution sequence of the program.
executeProgram();

/**
 * Orchestrates the overall program flow: calculates prime sum counts
 * and then processes user input to display results.
 */
function executeProgram() {
    // Generate an array where each index stores the count of ways it can be
    // represented as a sum of two prime numbers.
    const sumOccurrences = computePrimeSumCounts();

    let lineIndex = 0; // Index for iterating through input lines.
    let currentValue; // Variable to hold the numeric value from the current input line.

    // Loop through each line of input until a non-numeric or zero value is encountered.
    while ((currentValue = +inputLines[lineIndex++])) {
        // Output the pre-calculated count for the current input number.
        console.log(sumOccurrences[currentValue]);
    }
}

/**
 * Calculates and returns an array where each index 'N' contains the total
 * number of distinct pairs of prime numbers (p1, p2) such that p1 + p2 = N.
 * This function employs a sieve method to identify primes and then iterates
 * through them to find all possible sums.
 * @returns {Int16Array} An array where `result[n]` is the count of ways `n`
 *                       can be expressed as a sum of two primes.
 */
function computePrimeSumCounts() {
    // `sieveArray` acts as a boolean array for the Sieve of Eratosthenes.
    // `sieveArray[i] = 0` means `i` is potentially prime, `1` means `i` is composite.
    let sieveArray = new Int16Array(MAX_VALUE_LIMIT + 1);
    // `sumOccurrences` stores the final counts for each sum.
    let sumOccurrences = new Int16Array(MAX_VALUE_LIMIT + 1);
    // `foundPrimes` stores the actual prime numbers discovered.
    // The maximum number of primes up to 50000 is 5133, so 5134 elements are needed for 1-based indexing.
    let foundPrimes = new Int16Array(5134);

    // Initialize the sieve: 0 and 1 are not prime.
    sieveArray[0] = sieveArray[1] = 1;

    // Apply a modified Sieve of Eratosthenes to mark composite numbers.
    // We only need to iterate up to the square root of MAX_VALUE_LIMIT (approx. 223.6).
    for (let sieveIterator = 2; sieveIterator <= 224; sieveIterator++) {
        // If `sieveIterator` is already marked as composite, skip to the next number.
        if (sieveArray[sieveIterator]) {
            continue;
        }

        // Mark all multiples of the current prime `sieveIterator` as composite.
        // Start marking from `sieveIterator * 2` (equivalent to `sieveIterator << 1`).
        for (let sieveMultiplier = (sieveIterator << 1); sieveMultiplier <= MAX_VALUE_LIMIT; sieveMultiplier += sieveIterator) {
            sieveArray[sieveMultiplier] = 1;
        }
    }

    let primeCounter = 0; // Tracks the number of primes found so far.

    // Iterate from 1 up to the maximum limit to identify primes and calculate their sums.
    for (let numberToCheck = 1; numberToCheck <= MAX_VALUE_LIMIT; numberToCheck++) {
        // If `numberToCheck` is marked as composite, skip it.
        if (sieveArray[numberToCheck]) {
            continue;
        }

        // `numberToCheck` is a prime number. Add it to our list of found primes.
        foundPrimes[++primeCounter] = numberToCheck;

        // For the current prime `numberToCheck`, iterate through all previously found primes
        // (including `numberToCheck` itself, if it's the first prime being processed in this inner loop).
        for (let primeIndex = 1; primeIndex <= primeCounter; primeIndex++) {
            let currentSum = numberToCheck + foundPrimes[primeIndex];

            // If the sum exceeds the maximum limit, then any further sums involving
            // `numberToCheck` and larger primes will also exceed the limit.
            if (currentSum > 50000) {
                break;
            }

            // Increment the count for this specific sum.
            sumOccurrences[currentSum]++;
        }
    }

    // Return the array containing the calculated counts of prime sums.
    return sumOccurrences;
}
