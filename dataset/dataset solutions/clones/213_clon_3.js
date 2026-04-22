// Import the Node.js file system module for I/O operations
const fileSystemModule = require('fs');

/**
 * Reads all content from standard input synchronously and processes it into an array of lines.
 * Includes basic error handling for robust input acquisition.
 * @returns {Array<string>} An array where each element is a line from standard input.
 */
const acquireStandardInputLines = () => {
    try {
        // Read all available data from the standard input file descriptor (fd 0)
        const inputContentString = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
        // Split the content by newline characters. This will include an empty string
        // at the end if the input stream ends with a newline, similar to the original behavior.
        return inputContentString.split('\n');
    } catch (ioError) {
        // Log any errors encountered during input reading
        console.error("Critical error while attempting to read standard input:", ioError.message);
        // Return an empty array to prevent further processing with invalid data
        return [];
    }
};

// Global constant to store the processed input lines, initialized once.
const applicationInputData = acquireStandardInputLines();

// Initiate the main application logic.
executeMainProcessingRoutine();

/**
 * Defines the maximum number to check for primality and calculate sums up to.
 * This constant ensures consistency across the prime generation logic.
 * (The original value 104729 corresponds to the 10,000th prime number's index for cumulative sums).
 */
const PRIME_GENERATION_CEILING = 104729;

/**
 * Precomputes an array where each index `k` stores the cumulative sum of the first `k` prime numbers.
 * This is achieved using an optimized Sieve of Eratosthenes followed by a summation pass.
 * @returns {Int32Array} An array where `resultArray[k]` is the sum of the first `k` primes.
 *                       `resultArray[0]` will be 0.
 */
function precomputeCumulativePrimeSums() {
    // Input validation: Ensure the ceiling is large enough for meaningful prime calculation.
    if (PRIME_GENERATION_CEILING < 2) {
        console.error("PRIME_GENERATION_CEILING must be at least 2 to calculate primes. Returning empty array.");
        return new Int32Array(0);
    }

    // Initialize a Uint8Array for the Sieve of Eratosthenes.
    // `0` indicates a potential prime, `1` indicates a composite number.
    // Size is `PRIME_GENERATION_CEILING + 1` to allow direct indexing up to the ceiling.
    const isCompositeFlagArray = new Uint8Array(PRIME_GENERATION_CEILING + 1);

    // Explicitly mark 0 and 1 as non-prime (composite/not prime).
    isCompositeFlagArray[0] = 1;
    isCompositeFlagArray[1] = 1;

    // Calculate the square root of the ceiling for sieve optimization.
    // Primes only need to be checked up to this limit to mark all composites.
    const sieveIterationLimit = Math.floor(Math.sqrt(PRIME_GENERATION_CEILING));

    // Sieve of Eratosthenes implementation:
    // Iterate from 2 up to the square root limit.
    for (let currentCandidate = 2; currentCandidate <= sieveIterationLimit; currentCandidate++) {
        // If `currentCandidate` is already marked as composite, skip to the next number.
        if (isCompositeFlagArray[currentCandidate] === 1) {
            continue;
        }

        // Mark all multiples of the current prime number as composite.
        // Optimization: Start marking from `currentCandidate * currentCandidate`
        // because smaller multiples (e.g., `2*currentCandidate`, `3*currentCandidate`)
        // would have already been marked by their respective prime factors.
        for (let multipleIndex = currentCandidate * currentCandidate; multipleIndex <= PRIME_GENERATION_CEILING; multipleIndex += currentCandidate) {
            isCompositeFlagArray[multipleIndex] = 1;
        }
    }

    // Prepare an array to store the cumulative sums of primes.
    // `resultantSumArray[k]` will hold the sum of the first `k` prime numbers.
    const resultantSumArray = new Int32Array(PRIME_GENERATION_CEILING + 1);

    let runningSumOfPrimes = 0; // Accumulates the sum of primes found so far.
    let countOfPrimesFound = 0; // Tracks the ordinal position of the prime (1st, 2nd, etc.).

    // Iterate through all numbers from 2 up to the ceiling.
    for (let numberUnderTest = 2; numberUnderTest <= PRIME_GENERATION_CEILING; numberUnderTest++) {
        // If the number is not marked as composite (i.e., it is prime).
        if (isCompositeFlagArray[numberUnderTest] === 0) {
            runningSumOfPrimes += numberUnderTest; // Add the prime to the current running sum.
            countOfPrimesFound++;                 // Increment the count of primes found.
            // Store the current cumulative sum at the index corresponding to the prime count.
            resultantSumArray[countOfPrimesFound] = runningSumOfPrimes;
        }
    }

    return resultantSumArray;
}

/**
 * The primary function to process input lines and output corresponding cumulative prime sums.
 * It orchestrates the precomputation and then handles user queries.
 */
function executeMainProcessingRoutine() {
    // Obtain the precomputed cumulative sums of prime numbers.
    const cumulativePrimeSums = precomputeCumulativePrimeSums();

    // Guard clause: Check if input data was successfully acquired.
    if (!applicationInputData || applicationInputData.length === 0) {
        console.warn("No input lines were provided or could be read. The application will terminate.");
        return;
    }

    let currentLinePointer = 0;
    // Process each input line sequentially.
    // The loop continues as long as there are lines and no explicit termination signal is received.
    while (currentLinePointer < applicationInputData.length) {
        const rawInputText = applicationInputData[currentLinePointer].trim(); // Remove leading/trailing whitespace.

        // Check for termination signals: an empty line or the number '0'.
        if (rawInputText === '' || rawInputText === '0') {
            if (rawInputText === '0') {
                console.log("Input '0' detected. This is interpreted as a termination signal. Stopping further processing.");
            } else {
                // An empty line might be the last line of input or an accidental blank.
                // In both cases, it signals the end of meaningful input.
                console.log("Empty input line encountered. Assuming end of valid input.");
            }
            break; // Exit the processing loop.
        }

        // Convert the input string to an integer, specifying base 10.
        const requestedPrimeCount = parseInt(rawInputText, 10);

        // Input validation: Check if the parsed value is a valid positive integer.
        if (isNaN(requestedPrimeCount) || requestedPrimeCount < 1) {
            console.error(`Invalid or non-positive input '${rawInputText}' at line ${currentLinePointer + 1}. This line will be skipped.`);
            currentLinePointer++;
            continue; // Move to the next input line.
        }

        // Bounds check: Ensure the requested index is within the precomputed range.
        // `cumulativePrimeSums.length - 1` gives the maximum valid index (which is `countOfPrimesFound`).
        if (requestedPrimeCount >= cumulativePrimeSums.length) {
            console.warn(
                `Requested prime count ${requestedPrimeCount} is too large. ` +
                `Maximum supported count is ${cumulativePrimeSums.length - 1}. ` +
                `Input '${rawInputText}' at line ${currentLinePointer + 1} will be skipped.`
            );
            currentLinePointer++;
            continue; // Move to the next input line.
        }

        // Output the precomputed cumulative sum corresponding to the requested prime count.
        console.log(cumulativePrimeSums[requestedPrimeCount]);
        currentLinePointer++; // Advance to the next input line.
    }
}