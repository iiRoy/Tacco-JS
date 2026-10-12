'use strict';

// This function processes an array of input lines to find the first prime number
// greater than or equal to the initial value derived from the first line.
const processInput = (dataLines) => {
  // Parse the first element of the input array as an integer.
  // This integer sets the lower bound for our search.
  let initialValue = parseInt(dataLines[0]);

  // Iterate through numbers starting from 'initialValue' up to, but not including, '2 * initialValue'.
  // We are looking for the first prime number in this range.
  for (let currentNumber = initialValue; currentNumber < (2 * initialValue); currentNumber++) {
    // Initialize a flag to determine if the current number is prime.
    // A value of 0 means it's potentially prime, 1 means it's composite.
    let isPrimeFlag = 0;

    // Inner loop: Check for divisibility by numbers from 2 up to 'currentNumber - 2'.
    // If 'currentNumber' is divisible by any of these, it's not prime.
    for (let divisorCandidate = 2; divisorCandidate < currentNumber - 1; divisorCandidate++) {
      // If 'currentNumber' is perfectly divisible by 'divisorCandidate',
      // then 'currentNumber' is not a prime number.
      if (currentNumber % divisorCandidate === 0) {
        isPrimeFlag = 1; // Mark as composite.
        break;           // No need to check further divisors for this number.
      }
    }

    // After checking all potential divisors, if 'isPrimeFlag' is still 0,
    // it means 'currentNumber' is prime.
    if (!isPrimeFlag) {
      // Output the first prime number found and terminate the function.
      return console.log(currentNumber);
    }
  }
};

// Read input from standard input, decode as UTF-8, and split into lines.
// Then, pass the array of lines to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
