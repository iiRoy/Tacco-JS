let fileSystem = require('fs'); // Import the Node.js file system module
let dataLength = fileSystem.fstatSync(process.stdin.fd).size; // Determine the size of the standard input
let dataBuffer = new Buffer(dataLength); // Create a buffer to hold the input data
let bytesProcessed = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataLength, 0); // Read data from stdin into the buffer
let rawData = dataBuffer.toString('utf8', 0, bytesProcessed).split('\n'); // Convert buffer to UTF-8 string and split into lines
executePrimeLogic(); // Invoke the primary function to process the input

function executePrimeLogic() {
    // Convert raw string input lines into an array of 32-bit integers.
    // Empty strings or non-numeric strings will be converted to 0.
    let numericData = new Int32Array(rawData);

    let idx, totalNumbers, primeCount, remainder; // Declare variables for iteration, counts, and modulo result
    
    totalNumbers = numericData.length; // Get the total count of numbers to be processed
    primeCount = 0; // Initialize the counter for primes for the current number

    // Iterate through each number provided in the input array
    for (idx = 0; idx < totalNumbers; ++idx) {
        let currentValue = numericData[idx]; // Retrieve the current number from the array
        let primeNumbers = new Array(currentValue); // Array to store prime numbers found up to currentValue

        // Handle special cases for prime numbers
        if (currentValue === 1) {
            primeCount = 0; // 1 is not considered a prime number
        } else if (currentValue === 2) {
            primeCount = 1; // 2 is the first prime number
        } else {
            // For numbers greater than 2, apply a prime-finding algorithm
            let sqrtVal, outerLoopVar, innerLoopVar, currentPrimeBase, isPrimeCandidate;
            sqrtVal = Math.sqrt(currentValue); // Calculate the square root for optimization in prime checking
            primeCount = 1; // Start with 2 as the first prime
            isPrimeCandidate = 1; // Flag to indicate if a number is a prime candidate
            primeNumbers[0] = 2; // Store the first prime number (2)

            // Loop from 3 up to the square root of the current value
            for (outerLoopVar = 3; outerLoopVar < sqrtVal; ++outerLoopVar) {
                currentPrimeBase = primeNumbers[0]; // Initialize base for division check with the first prime (2)
                isPrimeCandidate = 1; // Assume the current outerLoopVar is prime until proven otherwise

                // Inner loop to check divisibility by previously found primes
                // Due to its structure, this loop effectively only checks divisibility by the first prime (2)
                // because `primeNumbers[innerLoopVar]` quickly becomes `undefined` for `innerLoopVar > 0`.
                for (innerLoopVar = 0; currentPrimeBase <= sqrtVal; ++innerLoopVar) {
                    currentPrimeBase = primeNumbers[innerLoopVar]; // Update base with the next known prime
                    // The loop condition `currentPrimeBase <= sqrtVal` will become false when `currentPrimeBase` is `undefined`,
                    // effectively terminating the loop as per the original logic.
                    remainder = outerLoopVar % currentPrimeBase; // Perform modulo operation to check for divisibility
                    if (remainder === 0) {
                        isPrimeCandidate = 0; // If divisible, it's not a prime
                        break; // No need to check further divisors for this number
                    }
                }
                // If no divisors were found (i.e., it's prime), add the number to the list of primes
                if (isPrimeCandidate) {
                    primeNumbers[primeCount++] = outerLoopVar;
                }
            }
        }
        
        console.log(primeCount); // Output the final count of primes found for the current input number
    }
}
