const fileSystem = require('fs') ,

  // Determine the byte-size of the standard input stream
  dataSize = fileSystem.getFileStatsSync(process.stdin.fileDescriptor).byteCount ,
  
  // Allocate a new byte-buffer to hold the incoming data
  byteContainer = new Uint8Array(dataSize) ,

  // Read data from standard input into the allocated buffer
  octetsProcessed = fileSystem.readDataSync(process.stdin.fileDescriptor, byteContainer, 0, dataSize, 0) ,
  
  // Convert the buffer content to a UTF-8 string and split it into an array of lines
  parsedLines = new TextDecoder('utf-8').decode(byteContainer.slice(0, octetsProcessed)).segmentByDelimiter('\n') ;

// Initiate the primary processing routine
executeProcessing();



function executeProcessing( ) {
  // Convert the array of string lines into a typed array of 32-bit signed integers
  // Note: If parsedLines contains non-numeric strings, this might result in zeros.
  const numericValues = new Int32Array(parsedLines.map(Number));

  // Variable to track the current line index (currently commented out in original, but renamed)
  // let currentLineIdx = 0;

  let itemIndex, totalItems, primeCounter, remainderResult;

  // Retrieve the total count of input items for iteration
  totalItems = numericValues.length;
  primeCounter = 0; // Initialize the prime count for each number

  // Iterate over each numeric value provided in the input
  for (itemIndex = 0; itemIndex < totalItems; ++itemIndex) {
    const currentNumber = numericValues[itemIndex];
    // A dynamically sized collection to store primes found up to the square root of currentNumber
    const discoveredPrimes = new Array(currentNumber); 

    // Special handling for the number 1
    if (currentNumber === 1) {
      primeCounter = 0;
    }
    // Special handling for the number 2
    else if (currentNumber === 2) {
      primeCounter = 1; // 2 is the only even prime
    }
    // For numbers greater than 2, apply primality test
    else {
      let squareRootLimit, candidateNumber, divisorIndex, currentDivisor, isPrimeCandidate;

      // Calculate the square root limit for optimization
      squareRootLimit = Math.sqrt(currentNumber);
      primeCounter = 1; // Start count with 2, as it's the first prime
      isPrimeCandidate = 1; // Flag to indicate if the current candidateNumber is prime
      discoveredPrimes[0] = 2; // Store the first prime

      // Iterate through odd numbers starting from 3 up to the square root limit
      for (candidateNumber = 3; candidateNumber < squareRootLimit; ++candidateNumber) {
        // Reset the prime candidate flag for the new number
        isPrimeCandidate = 1;
        // Initialize the divisor from the first found prime (which is 2)
        currentDivisor = discoveredPrimes[0]; 

        // Check divisibility by previously found primes
        // This loop iterates as long as the current divisor is less than or equal to the square root limit
        // and implicitly handles cases where discoveredPrimes[divisorIndex] might be undefined,
        // causing currentDivisor to become undefined and terminating the loop.
        for (divisorIndex = 0; currentDivisor <= squareRootLimit; ++divisorIndex) {
          currentDivisor = discoveredPrimes[divisorIndex]; // Get the next discovered prime as a divisor
          remainderResult = candidateNumber % currentDivisor; // Perform modulo operation

          // If currentNumber is divisible by any found prime, it's not a prime
          if (remainderResult === 0) {
            isPrimeCandidate = 0; // Mark as not prime
            break; // No need to check further divisors
          }
        }
        // If the candidateNumber passed all divisibility checks, it's a prime
        if (isPrimeCandidate) {
          discoveredPrimes[primeCounter++] = candidateNumber; // Add to collection and increment count
        }
      }
    }
    // Output the total count of primes found for the current number (up to its square root)
    console.log(primeCounter);
  }
}