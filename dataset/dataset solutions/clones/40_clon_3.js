const ioHandler = require('fs');

// Define a constant for the standard input file descriptor to improve readability
const STDIN_FILE_DESCRIPTOR = process.stdin.fd;

// Synchronously retrieve metadata for the standard input stream
const streamStatistics = ioHandler.fstatSync(STDIN_FILE_DESCRIPTOR);
const streamTotalBytes = streamStatistics.size;

// Allocate a new buffer of the determined size to hold incoming data
const inputSourceBuffer = Buffer.alloc(streamTotalBytes);

// Read data synchronously from standard input into the allocated buffer
const bytesSuccessfullyRead = ioHandler.readSync(STDIN_FILE_DESCRIPTOR, inputSourceBuffer, 0, streamTotalBytes, 0);

// Process the raw buffer: slice to actual bytes, decode to UTF-8,
// split into lines, trim whitespace, and filter out any empty lines.
const processedDataLines = inputSourceBuffer
    .slice(0, bytesSuccessfullyRead) // Only extract the portion of the buffer that was actually written to
    .toString('utf8')                // Convert the buffer content to a UTF-8 string
    .split('\n')                     // Divide the string into an array of lines based on newline characters
    .map(individualLine => individualLine.trim()) // Remove leading/trailing whitespace from each line
    .filter(trimmedLine => trimmedLine.length > 0); // Discard any lines that are empty after trimming

// Initiate the main data processing routine
executeInputProcessing();

// This helper function encapsulates the specific prime counting logic
// It mimics the original code's behavior of counting primes up to Math.sqrt(valueForAnalysis)
function determineSpecificPrimeCount(valueForAnalysis) {
    // Introduce a guard clause for non-numeric, NaN, or negative inputs
    if (typeof valueForAnalysis !== 'number' || isNaN(valueForAnalysis) || valueForAnalysis < 1) {
        // For robustness, handle invalid inputs gracefully
        return 0; // Returning 0 for invalid or non-positive numbers
    }

    // Handle base cases for prime counting
    if (valueForAnalysis === 1) {
        return 0; // 1 is not considered prime
    }
    if (valueForAnalysis === 2) {
        return 1; // 2 is the first prime number
    }

    // Initialize list of known primes and their count
    let identifiedPrimesCollection = [2];
    let currentPrimeAccumulator = 1;

    // Calculate the square root of the input value, which serves as the upper limit
    // for the primality search in the original algorithm's specific implementation
    const searchUpperBoundary = Math.sqrt(valueForAnalysis);

    // Iterate through odd numbers starting from 3 up to (but not including) the search upper boundary
    // This optimization skips even numbers, as 2 is the only even prime
    for (let potentialPrimeCandidate = 3; potentialPrimeCandidate < searchUpperBoundary; potentialPrimeCandidate += 2) {
        let hasDivisorBeenFound = false; // Flag to track if the candidate is composite

        // Check the potentialPrimeCandidate for divisibility by previously identified primes.
        // The inner loop condition `existingDivisor > searchUpperBoundary` explicitly
        // preserves the original code's behavior where the divisor check is limited by
        // the overall square root of the initial input value.
        for (const existingPrimeDivisor of identifiedPrimesCollection) {
            if (existingPrimeDivisor > searchUpperBoundary) {
                // If a known prime divisor exceeds the overall sqrt limit,
                // the original algorithm would cease using it for further checks.
                break;
            }
            if (potentialPrimeCandidate % existingPrimeDivisor === 0) {
                hasDivisorBeenFound = true; // Found a divisor, so it's not prime
                break;
            }
        }

        // If no divisors were found, the candidate is prime
        if (!hasDivisorBeenFound) {
            identifiedPrimesCollection.push(potentialPrimeCandidate);
            currentPrimeAccumulator++;
        }
    }
    return currentPrimeAccumulator;
}

// Renamed the main function for clarity and to indicate its role as an entry point
function executeInputProcessing() {
    // Convert the processed string lines into an array of integers.
    // Includes a filter to remove any entries that could not be parsed as valid numbers.
    const numericDataPoints = processedDataLines
        .map(lineValue => parseInt(lineValue, 10)) // Explicitly parse to base 10 integer
        .filter(numValue => !isNaN(numValue));     // Remove any results that are Not-a-Number

    // Store the total count of valid numeric inputs
    const totalDataElements = numericDataPoints.length;

    // Add a guard clause: if no valid numbers were successfully parsed, log an error and exit
    if (totalDataElements === 0) {
        // console.error("Error: No valid numeric data could be processed from input stream."); // Optional error logging
        return; // Terminate execution if no input is available
    }

    // Iterate through each numeric data point
    for (let elementIndex = 0; elementIndex < totalDataElements; ++elementIndex) {
        const currentNumericElement = numericDataPoints[elementIndex];

        // Utilize the helper function to determine the specific prime count for the current element
        const resultantPrimeCount = determineSpecificPrimeCount(currentNumericElement);

        // Output the calculated prime count to standard output, followed by a newline
        // Changed `console.log` to `process.stdout.write` for a different output mechanism
        process.stdout.write(resultantPrimeCount + '\n');
    }
}