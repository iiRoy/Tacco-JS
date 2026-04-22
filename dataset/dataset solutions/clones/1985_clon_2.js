function calculateCommonDivisor(firstNum, secondNum, thirdNum) {
  let greatestValue = 0; // Initialize a variable to hold the largest of the three input numbers.

  if (greatestValue < firstNum) {
    greatestValue = firstNum;
  }
  if (greatestValue < secondNum) {
    greatestValue = secondNum;
  }
  if (greatestValue < thirdNum) {
    greatestValue = thirdNum;
  }

  let currentHighestDivisor = 0; // This variable will store the largest common divisor found.

  // Iterate from 1 up to the greatest of the three numbers.
  for (let divisorCandidate = 1; divisorCandidate <= greatestValue; divisorCandidate++) {
    // This condition checks only odd numbers (and 1, 2) as potential divisors,
    // which is an optimization from the original code's logic.
    if (divisorCandidate <= 2 || divisorCandidate % 2 !== 0) {
      // Check if the current candidate divides all three numbers.
      // The `num >= divisorCandidate` check is redundant if `divisorCandidate` is a true divisor,
      // but maintained for structural consistency with the original.
      if (
        (firstNum % divisorCandidate === 0 && firstNum >= divisorCandidate) &&
        (secondNum % divisorCandidate === 0 && secondNum >= divisorCandidate) &&
        (thirdNum % divisorCandidate === 0 && thirdNum >= divisorCandidate)
      ) {
        currentHighestDivisor = divisorCandidate; // Update with the largest common divisor found so far.
      }
    }
  }

  return currentHighestDivisor; // Return the final greatest common divisor.
}

function ProcessInputAndCalculate(inputData) {
  // Parse the input string into an integer, which defines the upper limit for the loops.
  const upperCalculationLimit = parseInt(inputData, 10);

  let accumulatedTotal = 0; // Initialize a variable to store the sum of GCDs.

  // Three nested loops iterate from 1 up to the upper limit.
  for (let outerLoopIndex = 1; outerLoopIndex <= upperCalculationLimit; outerLoopIndex++) {
    for (let middleLoopIndex = 1; middleLoopIndex <= upperCalculationLimit; middleLoopIndex++) {
      for (let innerLoopIndex = 1; innerLoopIndex <= upperCalculationLimit; innerLoopIndex++) {
        // Debugging output could be enabled here if needed:
        // console.log(outerLoopIndex + ", " + middleLoopIndex + ", " + innerLoopIndex);

        // Call the helper function to get the GCD for the current set of indices
        // and add it to the running total.
        accumulatedTotal += calculateCommonDivisor(outerLoopIndex, middleLoopIndex, innerLoopIndex);
      }
    }
  }

  // Output the final computed sum to the console.
  console.log(accumulatedTotal);
}

// Read data from standard input and then initiate the main calculation process.
ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));