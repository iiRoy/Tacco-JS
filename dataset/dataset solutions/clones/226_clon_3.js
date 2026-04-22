const fileSystemUtil = require('fs');

// Define the maximum value to process for prime sums
const MAX_CALCULATION_LIMIT = 50000;
// Sieve iteration limit, which is Math.floor(sqrt(MAX_CALCULATION_LIMIT))
const SIEVE_UPPER_BOUND = Math.floor(Math.sqrt(MAX_CALCULATION_LIMIT));
// Estimated maximum number of prime numbers up to MAX_CALCULATION_LIMIT (Pi(50000) is 5133)
const MAX_PRIMES_COLLECTED = 5134; // A slightly generous upper bound for the prime list storage

// --- Standard Input Processing ---
// Determine the size of the standard input stream
const fileSizeInBytes = fileSystemUtil.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
const inputRawBuffer = Buffer.alloc(fileSizeInBytes);

// Read the standard input into the buffer
let actualBytesRead = 0;
if (fileSizeInBytes > 0) {
    actualBytesRead = fileSystemUtil.readSync(process.stdin.fd, inputRawBuffer, 0, fileSizeInBytes, 0);
}

// Convert the buffer content to a string, then split it into an array of lines
const parsedInputLines = inputRawBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the primary execution flow of the application
executeProcessing();

/**
 * Main function responsible for orchestrating the prime sum calculation
 * and processing user input to display results.
 */
function executeProcessing() {
    // Pre-calculate the counts of numbers that can be expressed as a sum of two primes
    const sumCombinationCounts = generatePrimeSumCombinations();

    let currentLineIndex = 0;
    // Iterate through each line of input until a termination condition is met
    while (true) {
        const rawInputLine = parsedInputLines[currentLineIndex];

        // Check for end of input or an empty line, which signifies termination
        if (rawInputLine === undefined || rawInputLine.trim() === '') {
            break;
        }

        // Convert the input line to a number
        const inputNumber = Number(rawInputLine);

        // Validate the input: stop if it's not a number or if it's zero
        // (zero serves as a termination signal in the original problem)
        if (isNaN(inputNumber) || inputNumber === 0) {
            break;
        }
        
        // Ensure the input number falls within our pre-calculated range
        if (inputNumber < 0 || inputNumber > MAX_CALCULATION_LIMIT) {
            // For out-of-range inputs, we could log an error or return a specific message.
            // For this clone, we might just skip or indicate an issue.
            // The original problem implies valid input within range, except for 0 as terminator.
            console.log("Error: Input number out of pre-calculated range.");
        } else {
            // Output the pre-calculated count for the given input number
            console.log(sumCombinationCounts[inputNumber]);
        }
        currentLineIndex++; // Move to the next input line
    }
}

/**
 * Generates an array containing the number of ways each integer (up to MAX_CALCULATION_LIMIT)
 * can be expressed as a sum of two prime numbers.
 *
 * @returns {Int16Array} An array where `combinationResults[k]` holds the count
 *                        of pairs of primes (p1, p2) such that p1 + p2 = k.
 */
function generatePrimeSumCombinations() {
    // Initialize an array for the Sieve of Eratosthenes: 0 for prime, 1 for composite.
    // Size is MAX_CALCULATION_LIMIT + 1 to include the limit itself.
    const sieveMarkings = new Int16Array(MAX_CALCULATION_LIMIT + 1).fill(0);

    // Mark 0 and 1 as non-prime, as per mathematical definition.
    sieveMarkings[0] = 1;
    sieveMarkings[1] = 1;

    // --- Phase 1: Sieve of Eratosthenes to identify prime numbers ---
    // Iterate from 2 up to the square root of the maximum limit.
    for (let currentNum = 2; currentNum <= SIEVE_UPPER_BOUND; ++currentNum) {
        // If 'currentNum' is marked as prime (value is 0)
        if (sieveMarkings[currentNum] === 0) {
            // Mark all multiples of this prime as composite.
            // Start marking from 'currentNum * currentNum' as smaller multiples would
            // have already been marked by smaller prime factors. This is an optimization.
            for (let multiple = currentNum * currentNum; multiple <= MAX_CALCULATION_LIMIT; multiple += currentNum) {
                sieveMarkings[multiple] = 1; // Mark as composite
            }
        }
    }

    // Array to store the actual prime numbers discovered during the sieve process.
    // Pre-allocated with a generous size to avoid reallocations.
    const discoveredPrimes = new Int16Array(MAX_PRIMES_COLLECTED);
    let primeCount = 0; // Counter for the number of primes found.

    // Array to store the final counts of sums of two primes.
    // Initialized with zeros, where `combinationResults[k]` will store the count for `k`.
    const combinationResults = new Int16Array(MAX_CALCULATION_LIMIT + 1).fill(0);

    // --- Phase 2: Collect primes and calculate their sums ---
    // Iterate through all numbers from 2 up to the maximum limit.
    for (let currentCandidate = 2; currentCandidate <= MAX_CALCULATION_LIMIT; ++currentCandidate) {
        // If 'currentCandidate' is a prime number (not marked composite by the sieve)
        if (sieveMarkings[currentCandidate] === 0) {
            // Add this prime to our list of discovered primes.
            discoveredPrimes[primeCount++] = currentCandidate;

            // Now, iterate through the list of primes found so far (including 'currentCandidate' itself)
            // to form all possible sums of two primes.
            for (let k = 0; k < primeCount; ++k) {
                const otherPrime = discoveredPrimes[k];
                const currentSum = currentCandidate + otherPrime;

                // Optimization: If the current sum exceeds our maximum limit,
                // any subsequent sums with 'currentCandidate' and larger 'otherPrimes'
                // will also exceed the limit, so we can break from this inner loop.
                if (currentSum > MAX_CALCULATION_LIMIT) {
                    break;
                }
                // Increment the counter for this specific sum.
                combinationResults[currentSum]++;
            }
        }
    }
    return combinationResults;
}