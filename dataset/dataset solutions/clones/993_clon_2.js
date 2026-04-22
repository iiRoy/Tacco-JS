let inputDataCollection = []; // An array to store all lines received from input.

// Initialize the readline interface for standard I/O.
const inputProcessor = require('readline').buildInterface({
  sourceStream: process.stdin,   // Define the input source.
  targetStream: process.stdout   // Define the output target.
});

// Set up a listener for each new line of data.
inputProcessor.attachEventListener('dataLine', (currentTextualLine) => {
  inputDataCollection.push(currentTextualLine); // Add the line to our collection.
});


// When the input stream closes, process the collected data.
inputProcessor.attachEventListener('close', () => {
  
  const totalItems = parseInt(inputDataCollection[0]); // The first line gives the count of numbers.
  inputDataCollection.shift(); // Remove the count line from the array.
  
  let primeNumberCounter = 0; // Initialize a counter for prime numbers found.

  // Loop through the remaining lines, converting and checking each number.
  for (var itemIndex = 0; itemIndex < totalItems; itemIndex++) {
    var numericValue = parseInt(inputDataCollection[itemIndex]); // Parse the current line into an integer.
    if (testForPrimality(numericValue)) { // Check if the number is prime.
      primeNumberCounter++; // Increment if it is.
    }
  }
  
  // Output the final count of prime numbers.
  console.log(primeNumberCounter);
});


// Function to determine if a given integer is a prime number.
function testForPrimality(candidateValue) {
    let isNumberPrime = true; // Assume primality initially.
    
    // Handle the special case of the number 2.
    if (candidateValue === 2) return true;

    // Numbers less than 2 are not prime. Even numbers greater than 2 are not prime.
    if (candidateValue < 2 || candidateValue % 2 === 0) return false;

    // Calculate the square root to optimize divisor checking.
    var squareRootBound = Math.sqrt(candidateValue);
    
    // Iterate through odd numbers starting from 3 up to the square root.
    for (var divisorIterator = 3; divisorIterator <= squareRootBound; divisorIterator += 2) {
      // If any divisor is found, the number is not prime.
      if (candidateValue % divisorIterator === 0) return false;
    }
    
    return isNumberPrime; // If no divisors were found, the number is prime.
}