function calculateCommonDivisor(firstNum, secondNum, thirdNum) {
  // Initialize a variable to store the largest of the three numbers
  let maximumValue = 0;

  // Determine the maximum value among the inputs
  if (maximumValue < firstNum) {
    maximumValue = firstNum;
  }
  if (maximumValue < secondNum) {
    maximumValue = secondNum;
  }
  if (maximumValue < thirdNum) {
    maximumValue = thirdNum;
  }

  // This variable will hold the greatest common divisor found so far
  let currentDivisor = 0;

  // Iterate from 1 up to the maximum value
  for (let divisorCandidate = 1; divisorCandidate <= maximumValue; divisorCandidate++) {
    // Optimization: only check 1, 2, and odd numbers greater than 2
    if (divisorCandidate <= 2 || divisorCandidate % 2 !== 0) {
      // Check if the current candidate divides all three numbers
      // and is not greater than any of them (redundant check if numbers are positive, but preserved)
      if (
        (firstNum % divisorCandidate === 0 && firstNum >= divisorCandidate) &&
        (secondNum % divisorCandidate === 0 && secondNum >= divisorCandidate) &&
        (thirdNum % divisorCandidate === 0 && thirdNum >= divisorCandidate)
      ) {
        currentDivisor = divisorCandidate; // Update the common divisor
      }
    }
  }

  // Return the last common divisor found
  return currentDivisor;
}

function processInput(rawData) {
  // Parse the input string into an integer, base 10
  const limitValue = parseInt(rawData, 10);

  // Initialize a variable to accumulate the sum of common divisors
  let totalSum = 0;

  // Outer loop iterates from 1 to N
  for (let outerLoopVar = 1; outerLoopVar <= limitValue; outerLoopVar++) {
    // Middle loop iterates from 1 to N
    for (let middleLoopVar = 1; middleLoopVar <= limitValue; middleLoopVar++) {
      // Inner loop iterates from 1 to N
      for (let innerLoopVar = 1; innerLoopVar <= limitValue; innerLoopVar++) {
        // Calculate the specific common divisor for the current triplet
        // and add it to the running total
        totalSum += calculateCommonDivisor(outerLoopVar, middleLoopVar, innerLoopVar);
      }
    }
  }

  // Output the final calculated sum to the console
  console.log(totalSum);
}

// Read input from standard input and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
