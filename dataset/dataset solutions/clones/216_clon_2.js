// Input processing utility
const fileSystemModule = require('fs');

// Determine the size of the standard input stream
let fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming data
const dataBuffer = new Buffer(fileSize);

// Read data from standard input into the buffer
let actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string and split into lines
const inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the primary execution flow
programEntry();


// Main application logic begins here
function programEntry() {
    // Obtain an array where each index stores the sum of primes up to that index
    const primeSumsArray = computePrimePrefixSums();

    // Iterate through each line of input data, excluding the potential trailing empty line
    for (let lineIndex = 0, totalLines = inputLines.length - 1; lineIndex < totalLines; lineIndex++) {
        // Convert the current input line to a number
        let currentNumericInput = inputLines[lineIndex] - 0;

        // Skip processing if the input value is zero (or falsy after conversion)
        if (!currentNumericInput) {
            continue;
        }

        // Output the pre-calculated sum of primes corresponding to the input number
        console.log(primeSumsArray[currentNumericInput]);
    }
}


// Function to generate prime numbers up to a certain limit and calculate their prefix sums
function computePrimePrefixSums() {
    const upperLimit = 10000; // Define the maximum value to consider for primality

    // Initialize a boolean-like array for the Sieve of Eratosthenes
    // 0 indicates potentially prime, 1 indicates composite (or marked)
    const sieveMarkings = new Uint8Array(upperLimit + 1);

    // Mark 0 and 1 as non-prime (composite for the purpose of the sieve)
    sieveMarkings[0] = sieveMarkings[1] = 1;

    // Sieve of Eratosthenes algorithm: Mark multiples of primes as composite
    for (let currentNumber = 2, sqrtUpperLimit = Math.trunc(Math.sqrt(upperLimit)); currentNumber <= sqrtUpperLimit; currentNumber++) {
        // If the current number is already marked as composite, skip it
        if (sieveMarkings[currentNumber]) {
            continue;
        }

        // Mark all multiples of the current prime as composite
        // Start from currentNumber * 2
        for (let multipleValue = (currentNumber * 2); multipleValue <= upperLimit; multipleValue += currentNumber) {
            sieveMarkings[multipleValue] = 1;
        }
    }

    // Initialize an array to store the cumulative sums of prime numbers
    const cumulativePrimeSums = new Uint32Array(upperLimit + 1);
    let runningSum = 0; // Accumulator for the sum of primes
    let primeCountIndex = 0; // Index for storing sums in the cumulative array

    // Iterate from 1 to the upper limit to calculate prefix sums of primes
    for (let numberToCheck = 1; numberToCheck <= upperLimit; numberToCheck++) {
        // If the current number is not marked as composite (i.e., it's prime)
        if (!sieveMarkings[numberToCheck]) {
            // Update the running sum and store it in the cumulative sums array
            runningSum = cumulativePrimeSums[primeCountIndex] += runningSum + numberToCheck;
            primeCountIndex++; // Increment the index for the next prime sum
        }
    }

    // Return the array containing prefix sums of primes
    return cumulativePrimeSums;
}