function checkPrimality (candidateVal) {
  // Check if the number is 2, which is the only even prime number.
  if (candidateVal === 2) {
    return true; // 2 is prime.
  } else {
    // Iterate from 2 up to (but not including) the candidate number.
    // This loop checks for any divisors.
    for (let divisorIter = 2; divisorIter < candidateVal; divisorIter++) {
      // If the candidate number is perfectly divisible by divisorIter, it's not prime.
      if (candidateVal % divisorIter === 0) {
        return false; // Not a prime number.
        // The 'break' statement here is redundant as 'return' exits the function.
        break;
      }
      // If the loop has reached the number just before the candidate itself,
      // and no divisors were found, then the number is prime.
      if (divisorIter + 1 === candidateVal) {
        return true; // It's a prime number.
      }
    }
  }
}

// Read input from standard input, decode as UTF-8, split by newlines.
// Then take the second line (index 1) and split it by spaces.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");
rawData = rawData[1].split(" ");

// Initialize an array to store prime numbers found in the input.
const primeCollection = [];

// Iterate over each element in the processed input data.
rawData.forEach((elementVal) => {
  // Convert the string element to a number and check if it's prime.
  if (checkPrimality(Number(elementVal))) {
    // If it's prime, add the numeric value to our prime collection.
    primeCollection.push(Number(elementVal));
  }
});

// Initialize a variable to keep track of the greatest remainder sum found.
let greatestRemainderSum = 0;

// Start an infinite loop with an outer counter, beginning from 1.
for (let outerCounter = 1; ; outerCounter++) {
  // Initialize the current remainder sum for this iteration of outerCounter.
  let currentRemainderSum = 0;

  // For each prime number in our collection, calculate the remainder
  // when outerCounter is divided by that prime, and add it to currentRemainderSum.
  primeCollection.forEach((elementVal) => {
    currentRemainderSum += outerCounter % elementVal;
  });

  // If the current remainder sum is zero, it means outerCounter is
  // perfectly divisible by all prime numbers in the collection.
  // This is the termination condition for the loop.
  if (currentRemainderSum === 0) {
    break; // Exit the infinite loop.
  }

  // If the current remainder sum is greater than the greatest sum found so far,
  // update the greatest sum.
  if (greatestRemainderSum < currentRemainderSum) {
    greatestRemainderSum = currentRemainderSum;
  }
}

// Output the final greatest remainder sum to the console.
console.log(greatestRemainderSum);
