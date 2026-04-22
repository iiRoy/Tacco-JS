function PrimaryProcess(rawData) {
  // First, tidy up the raw textual input.
  let processedData = rawData.trim();

  // Convert the cleaned string into an integer, using base 10.
  const upperLimit = parseInt(processedData, 10);

  // The objective is to find the sum of divisor counts for (upperLimit - iteratorVal).

  let totalOccurrences = 0; // Initialize a variable to accumulate the total count.
  for (let iteratorVal = 1; iteratorVal < upperLimit; iteratorVal++) {
    // Calculate the difference between the upper bound and the current loop value.
    const difference = upperLimit - iteratorVal;

    // Add the number of divisors for this difference to our running total.
    totalOccurrences += calculateDivisorCount(difference);
  }

  // Display the final computed sum of divisor counts.
  console.log(totalOccurrences);
}

// A helper routine designed to ascertain the total number of positive divisors for an integer.
function calculateDivisorCount(targetNumber) {
  let divisorTally = 0; // This variable will store the count of divisors found.
  let sqrtMatch = 0;    // This flag indicates if the target number is a perfect square.

  // Iterate from 1 up to the square root of the target number.
  // This optimizes the search as divisors come in pairs (except for the square root itself).
  for (let factorCandidate = 1; factorCandidate * factorCandidate <= targetNumber; factorCandidate++) {
    // If the current factorCandidate does not divide the targetNumber evenly, skip it.
    if (targetNumber % factorCandidate !== 0) {
      continue;
    }

    // If factorCandidate squared equals the targetNumber, it means factorCandidate is the square root.
    // In this case, it's a single divisor, not a pair.
    if (factorCandidate * factorCandidate === targetNumber) {
      sqrtMatch++;
    }
    divisorTally++; // Increment our count for the found divisor.
  }

  // Multiply the count by 2 because each divisor (except square roots) has a corresponding pair.
  // Subtract 'sqrtMatch' to correct for perfect squares, which were counted once but would be doubled.
  return divisorTally * 2 - sqrtMatch;
}

// Invoke the primary processing function, reading input from standard input stream.
PrimaryProcess(require("fs").readFileSync("/dev/stdin", "utf8"));