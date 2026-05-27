var fileSystemModule = require('fs');

function readAllStdinSync() {
    const stdinFileDescriptor = process.stdin.fd;
    const bufferReadOffset = 0;
    const bufferWriteOffset = 0;
    const stringEncoding = 'utf8';

    const inputBufferLength = fileSystemModule.fstatSync(stdinFileDescriptor).size;
    const dataBuffer = Buffer.alloc(inputBufferLength);
    const actualBytesRead = fileSystemModule.readSync(stdinFileDescriptor, dataBuffer, bufferWriteOffset, inputBufferLength, bufferReadOffset);
    
    return dataBuffer.toString(stringEncoding, bufferReadOffset, actualBytesRead);
}

var inputLines = readAllStdinSync().split('\n');

processInputData();

function processInputData() {
    var cachedPrimes = generatePrimeSieve();
    
    const lastLineSkipCount = 1; // Exclude the last line, common in competitive programming
    const totalInputLines = inputLines.length - lastLineSkipCount;

    for (let lineIndex = 0; lineIndex < totalInputLines; lineIndex++) {
        const currentInputVal = Number(inputLines[lineIndex]); // Convert string input to number
        
        let lowerBoundPrime = 0;
        let upperBoundPrime = 0;

        const totalPrimesInCache = cachedPrimes.length;
        for (let primeIndex = 0; primeIndex < totalPrimesInCache; primeIndex++) {
            const currentPrime = cachedPrimes[primeIndex];
            const nextPrime = cachedPrimes[primeIndex + 1]; // This can be undefined for the very last prime

            // Determine the largest prime strictly less than currentInputVal
            // If nextPrime is undefined, nextPrime >= currentInputVal evaluates to false.
            if (currentPrime < currentInputVal && nextPrime >= currentInputVal) {
                lowerBoundPrime = currentPrime;
            }

            // Determine the smallest prime strictly greater than currentInputVal
            // If nextPrime is undefined, nextPrime > currentInputVal evaluates to false.
            if (currentPrime <= currentInputVal && nextPrime !== undefined && nextPrime > currentInputVal) {
                upperBoundPrime = nextPrime;
                // The original code breaks here once upperBoundPrime is found.
                break; 
            }
        }
        
        console.log(lowerBoundPrime, upperBoundPrime);
    }
}
   
function generatePrimeSieve() {
    const SIEVE_MAX_VALUE = 50023; // The upper limit for prime number generation
    const ESTIMATED_PRIME_COUNT = 5135; // Pre-calculated count of primes up to SIEVE_MAX_VALUE

    // Initialize a boolean-like array for the sieve. 0 means prime, 1 means not prime.
    // Int8Array is memory efficient for this purpose.
    var sieveArray = new Int8Array(SIEVE_MAX_VALUE + 1);
   
    // Mark 0 and 1 as not prime, as per convention
    sieveArray[0] = 1;
    sieveArray[1] = 1;

    // Sieve of Eratosthenes algorithm
    const sqrtOfSieveMax = Math.floor(Math.sqrt(SIEVE_MAX_VALUE));
    for (let primeCandidate = 2; primeCandidate <= sqrtOfSieveMax; primeCandidate++) {
        // If primeCandidate is already marked as not prime, skip it
        if (sieveArray[primeCandidate]) {
            continue;
        }
       
        // Mark all multiples of the current primeCandidate as not prime
        // Start marking from 2 * primeCandidate (original `i<<1`)
        for (let multiple = (primeCandidate * 2); multiple <= SIEVE_MAX_VALUE; multiple += primeCandidate) {
            sieveArray[multiple] = 1;
        }
    }
   
    // Collect all identified prime numbers into a new array
    var resultantPrimes = new Int32Array(ESTIMATED_PRIME_COUNT);
    let resultIndex = 0;
    const startNumberCheck = 1; // Start checking from 1, as 0 is handled

    for (let currentNumber = startNumberCheck; currentNumber <= SIEVE_MAX_VALUE; currentNumber++) {
        // If currentNumber is not marked (i.e., it's prime)
        if (!sieveArray[currentNumber]) {
            resultantPrimes[resultIndex++] = currentNumber;
        }
    }
         
    return resultantPrimes;
}
