let inputData = []; // Array to store incoming lines of text

// Initialize a readline interface for handling standard input and output
const inputHandler = require('readline').createInterface({
  input: process.stdin,  // Read from standard input
  output: process.stdout // Write to standard output (though not used directly here)
});

// Event listener for each line of input received
inputHandler.on('dataReceived', (currentLine) => {
  inputData.push(currentLine); // Add the current line to our data array
});

// Event listener for when the input stream closes
inputHandler.on('close', () => {
  // Parse the first line to get the total count of numbers to process
  const totalCount = parseInt(inputData[0]);
  inputData.shift(); // Remove the first line as it's already processed

  let primeCounter = 0; // Initialize a counter for prime numbers

  // Iterate through the remaining lines, which contain the numbers
  for (let idx = 0; idx < totalCount; idx++) {
    // Convert the current line to an integer
    let currentNum = parseInt(inputData[idx]);
    // Check if the number is prime and increment the counter if it is
    if (checkIfPrime(currentNum)) {
      primeCounter++;
    }
  }

  // Output the final count of prime numbers found
  console.log(primeCounter);
});

/**
 * Determines if a given integer is a prime number.
 * @param {number} valueToCheck The integer to be checked for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfPrime(valueToCheck) {
    let isItPrime = true; // Assume it's prime initially

    // Special case: 2 is the only even prime number
    if (valueToCheck === 2) {
        return true;
    }

    // Numbers less than 2 are not prime, and even numbers greater than 2 are not prime
    if (valueToCheck < 2 || valueToCheck % 2 === 0) {
        return false;
    }

    // Calculate the square root of the number for optimization
    let squareRootVal = Math.sqrt(valueToCheck);

    // Iterate from 3 up to the square root, checking only odd divisors
    for (let divisor = 3; divisor <= squareRootVal; divisor += 2) {
      // If the number is divisible by any odd divisor, it's not prime
      if (valueToCheck % divisor === 0) {
        return false;
      }
    }

    // If no divisors were found, the number is prime
    return isItPrime;
}
